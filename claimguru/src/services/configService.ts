/**
 * Configuration Service for ClaimGuru
 * Handles API keys and environment configuration
 */

interface AppConfig {
  googleMapsApiKey: string;
  isGoogleMapsEnabled: boolean;
  openaiApiKey: string;
  isOpenAIEnabled: boolean;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = {
      googleMapsApiKey: this.getGoogleMapsApiKey(),
      isGoogleMapsEnabled: false,
      openaiApiKey: this.getOpenAIApiKey(),
      isOpenAIEnabled: false
    };
    
    // Check if Google Maps is properly configured
    this.config.isGoogleMapsEnabled = this.validateGoogleMapsConfig();
    
    // Check if OpenAI is properly configured
    this.config.isOpenAIEnabled = this.validateOpenAIConfig();
    
    if (this.config.isGoogleMapsEnabled) {
      console.log('Google Maps API configured successfully');
    } else {
      console.warn('Google Maps API not configured - using demo mode');
    }
    
    if (this.config.isOpenAIEnabled) {
      console.log('OpenAI API configured successfully');
    } else {
      console.warn('OpenAI API not configured - using mock responses');
    }
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private getGoogleMapsApiKey(): string {
    // Try multiple possible environment variable names, prioritizing the secret
    const possibleKeys = [
      import.meta.env.GOOGLEMAPS_API, // From secrets
      import.meta.env.VITE_GOOGLEMAPS_API, // Vite version of secret
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
      import.meta.env.GOOGLE_MAPS_API_KEY,
      import.meta.env.GOOGLEMAPS_API_KEY,
      import.meta.env.GOOGLE_PLACES_API_KEY,
      process.env.GOOGLEMAPS_API // Server-side access
    ];

    for (const key of possibleKeys) {
      if (key && key !== '' && key !== 'undefined' && key !== 'DEMO_MODE') {
        console.log('🗝️ Google Maps API key found and configured');
        return key;
      }
    }

    console.warn('⚠️ Google Maps API key not found in environment variables');
    return '';
  }

  private validateGoogleMapsConfig(): boolean {
    const apiKey = this.config.googleMapsApiKey;
    
    if (!apiKey || apiKey === '' || apiKey === 'DEMO_MODE') {
      return false;
    }

    // Basic validation - Google Maps API keys should start with 'AIza'
    if (apiKey.startsWith('AIza') && apiKey.length > 20) {
      return true;
    }

    console.warn('Google Maps API key format may be invalid');
    return false;
  }

  public getGoogleMapsConfig() {
    return {
      apiKey: this.config.googleMapsApiKey,
      isEnabled: this.config.isGoogleMapsEnabled
    };
  }

  public isGoogleMapsEnabled(): boolean {
    return this.config.isGoogleMapsEnabled;
  }

  public getApiKey(): string {
    return this.config.googleMapsApiKey;
  }

  private getOpenAIApiKey(): string {
    // OpenAI API key is now stored securely in Supabase secrets and accessed via edge functions
    // The frontend does not need the actual API key, just checking if the edge function is available
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    if (supabaseUrl && supabaseUrl !== '' && supabaseUrl !== 'undefined') {
      console.log('Supabase URL configured for OpenAI edge functions');
      return 'EDGE_FUNCTION_ENABLED'; // We don't need the actual API key in frontend
    }

    console.warn('Supabase URL not found - OpenAI edge functions may not be available');
    return '';
  }

  private validateOpenAIConfig(): boolean {
    const apiKey = this.config.openaiApiKey;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    // We're now using Supabase edge functions to access OpenAI
    // We just need to verify that we have the Supabase URL and anon key configured
    if (!apiKey || apiKey === '' || apiKey === 'DEMO_MODE') {
      return false;
    }

    if (supabaseUrl && supabaseUrl !== '' && supabaseAnonKey && supabaseAnonKey !== '') {
      console.log('OpenAI via Supabase edge functions is enabled');
      return true;
    }

    console.warn('Supabase configuration for OpenAI edge functions may be invalid');
    return false;
  }

  public getOpenAIConfig() {
    return {
      apiKey: this.config.openaiApiKey,
      isEnabled: this.config.isOpenAIEnabled
    };
  }

  public isOpenAIEnabled(): boolean {
    return this.config.isOpenAIEnabled;
  }
}

export const configService = ConfigService.getInstance();
export default configService;
