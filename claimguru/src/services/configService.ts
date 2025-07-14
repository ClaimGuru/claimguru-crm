/**
 * Configuration Service for ClaimGuru
 * Handles API keys and environment configuration
 */

interface AppConfig {
  googleMapsApiKey: string;
  isGoogleMapsEnabled: boolean;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = {
      googleMapsApiKey: this.getGoogleMapsApiKey(),
      isGoogleMapsEnabled: false
    };
    
    // Check if Google Maps is properly configured
    this.config.isGoogleMapsEnabled = this.validateGoogleMapsConfig();
    
    if (this.config.isGoogleMapsEnabled) {
      console.log('✅ Google Maps API configured successfully');
    } else {
      console.warn('⚠️ Google Maps API not configured - using demo mode');
    }
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private getGoogleMapsApiKey(): string {
    // Try multiple possible environment variable names
    const possibleKeys = [
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
      import.meta.env.GOOGLE_MAPS_API_KEY,
      import.meta.env.GOOGLEMAPS_API_KEY,
      import.meta.env.GOOGLE_PLACES_API_KEY
    ];

    for (const key of possibleKeys) {
      if (key && key !== '' && key !== 'undefined' && key !== 'DEMO_MODE') {
        return key;
      }
    }

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
}

export const configService = ConfigService.getInstance();
export default configService;
