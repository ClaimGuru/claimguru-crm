/**
 * WIZARD PROGRESS SERVICE - ClaimGuru
 * 
 * Handles automatic progress saving and task creation for claim wizard
 * Ensures users never lose progress if interrupted
 */

import { supabase } from '../lib/supabase';

export interface WizardProgress {
  id?: string;
  user_id: string;
  organization_id: string;
  wizard_type: 'claim' | 'client' | 'policy';
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  wizard_data: any;
  step_statuses: {
    [stepId: string]: {
      completed: boolean;
      required: boolean;
      validation_errors?: string[];
      completed_at?: string;
    };
  };
  last_saved_at: string;
  last_active_at: string;
  created_at?: string;
  expires_at: string; // Auto-cleanup after 30 days
  reminder_task_id?: string;
}

export interface ProgressTask {
  id?: string;
  user_id: string;
  organization_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  task_type: 'wizard_completion' | 'follow_up' | 'reminder';
  related_entity_type: 'wizard_progress' | 'claim' | 'client';
  related_entity_id: string;
  metadata: any;
  created_at?: string;
}

export class WizardProgressService {
  /**
   * Save wizard progress automatically
   */
  static async saveProgress(progress: Omit<WizardProgress, 'id' | 'created_at'>): Promise<WizardProgress | null> {
    try {
      console.log('💾 Saving wizard progress...', {
        step: progress.current_step,
        type: progress.wizard_type,
        progress: progress.progress_percentage
      });

      // Check if progress already exists
      const { data: existingProgress, error: searchError } = await supabase
        .from('wizard_progress')
        .select('*')
        .eq('user_id', progress.user_id)
        .eq('wizard_type', progress.wizard_type)
        .eq('organization_id', progress.organization_id)
        .single();

      if (searchError && searchError.code !== 'PGRST116') { // Not found is OK
        console.error('Error checking existing progress:', searchError);
        return null;
      }

      const progressData = {
        ...progress,
        last_saved_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      let savedProgress: WizardProgress;

      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('wizard_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating wizard progress:', error);
          return null;
        }
        savedProgress = data;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('wizard_progress')
          .insert([progressData])
          .select()
          .single();

        if (error) {
          console.error('Error saving wizard progress:', error);
          return null;
        }
        savedProgress = data;
      }

      // Create or update reminder task if needed
      await this.manageReminderTask(savedProgress);

      console.log('✅ Wizard progress saved successfully');
      return savedProgress;

    } catch (error) {
      console.error('❌ Failed to save wizard progress:', error);
      return null;
    }
  }

  /**
   * Load existing wizard progress
   */
  static async loadProgress(userId: string, organizationId: string, wizardType: string): Promise<WizardProgress | null> {
    try {
      const { data, error } = await supabase
        .from('wizard_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('wizard_type', wizardType)
        .order('last_active_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No progress found
          return null;
        }
        console.error('Error loading wizard progress:', error);
        return null;
      }

      // Update last active time
      await supabase
        .from('wizard_progress')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('❌ Failed to load wizard progress:', error);
      return null;
    }
  }

  /**
   * Create completion reminder task
   */
  private static async manageReminderTask(progress: WizardProgress): Promise<void> {
    try {
      // Don't create task if wizard is completed
      if (progress.progress_percentage >= 100) {
        // Cancel existing reminder if wizard is completed
        if (progress.reminder_task_id) {
          await this.cancelTask(progress.reminder_task_id);
        }
        return;
      }

      // Calculate due date (24 hours from now)
      const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const taskData: Omit<ProgressTask, 'id' | 'created_at'> = {
        user_id: progress.user_id,
        organization_id: progress.organization_id,
        title: `Complete ${progress.wizard_type} wizard`,
        description: `You have an incomplete ${progress.wizard_type} wizard at step ${progress.current_step + 1} of ${progress.total_steps}. Please complete it to avoid losing progress.`,
        priority: 'medium',
        due_date: dueDate.toISOString(),
        status: 'pending',
        task_type: 'wizard_completion',
        related_entity_type: 'wizard_progress',
        related_entity_id: progress.id!,
        metadata: {
          wizard_type: progress.wizard_type,
          current_step: progress.current_step,
          total_steps: progress.total_steps,
          progress_percentage: progress.progress_percentage,
          last_saved_at: progress.last_saved_at
        }
      };

      if (progress.reminder_task_id) {
        // Update existing task
        await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', progress.reminder_task_id);
      } else {
        // Create new task
        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert([taskData])
          .select()
          .single();

        if (error) {
          console.error('Error creating reminder task:', error);
          return;
        }

        // Update progress with task ID
        await supabase
          .from('wizard_progress')
          .update({ reminder_task_id: newTask.id })
          .eq('id', progress.id!);
      }

      console.log('✅ Reminder task created/updated for wizard completion');
    } catch (error) {
      console.error('❌ Failed to create reminder task:', error);
    }
  }

  /**
   * Cancel reminder task
   */
  private static async cancelTask(taskId: string): Promise<void> {
    try {
      await supabase
        .from('tasks')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
    } catch (error) {
      console.error('Error cancelling task:', error);
    }
  }

  /**
   * Mark wizard as completed
   */
  static async markCompleted(progressId: string, finalData: any): Promise<void> {
    try {
      const { data: progress } = await supabase
        .from('wizard_progress')
        .select('reminder_task_id')
        .eq('id', progressId)
        .single();

      // Update progress to completed
      await supabase
        .from('wizard_progress')
        .update({
          progress_percentage: 100,
          wizard_data: finalData,
          last_saved_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        })
        .eq('id', progressId);

      // Cancel reminder task
      if (progress?.reminder_task_id) {
        await this.cancelTask(progress.reminder_task_id);
      }

      console.log('✅ Wizard marked as completed');
    } catch (error) {
      console.error('❌ Failed to mark wizard as completed:', error);
    }
  }

  /**
   * Delete wizard progress (when user cancels or explicitly deletes)
   */
  static async deleteProgress(progressId: string): Promise<void> {
    try {
      const { data: progress } = await supabase
        .from('wizard_progress')
        .select('reminder_task_id')
        .eq('id', progressId)
        .single();

      // Cancel reminder task
      if (progress?.reminder_task_id) {
        await this.cancelTask(progress.reminder_task_id);
      }

      // Delete progress
      await supabase
        .from('wizard_progress')
        .delete()
        .eq('id', progressId);

      console.log('✅ Wizard progress deleted');
    } catch (error) {
      console.error('❌ Failed to delete wizard progress:', error);
    }
  }

  /**
   * Get all incomplete wizards for a user
   */
  static async getIncompleteWizards(userId: string, organizationId: string): Promise<WizardProgress[]> {
    try {
      const { data, error } = await supabase
        .from('wizard_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .lt('progress_percentage', 100)
        .order('last_active_at', { ascending: false });

      if (error) {
        console.error('Error loading incomplete wizards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to load incomplete wizards:', error);
      return [];
    }
  }

  /**
   * Cleanup expired progress entries
   */
  static async cleanupExpiredProgress(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Get expired progress entries with reminder tasks
      const { data: expiredProgress } = await supabase
        .from('wizard_progress')
        .select('id, reminder_task_id')
        .lt('expires_at', now);

      // Cancel reminder tasks for expired progress
      if (expiredProgress) {
        for (const progress of expiredProgress) {
          if (progress.reminder_task_id) {
            await this.cancelTask(progress.reminder_task_id);
          }
        }
      }

      // Delete expired progress
      await supabase
        .from('wizard_progress')
        .delete()
        .lt('expires_at', now);

      console.log('✅ Cleaned up expired wizard progress');
    } catch (error) {
      console.error('❌ Failed to cleanup expired progress:', error);
    }
  }
}