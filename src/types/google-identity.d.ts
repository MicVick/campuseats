// Minimal ambient types for the Google Identity Services (GIS) client script
// loaded at runtime from https://accounts.google.com/gsi/client

interface GoogleIdCredentialResponse {
  credential: string;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleIdCredentialResponse) => void;
  hd?: string;
}

interface GoogleIdButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: GoogleIdConfig) => void;
        renderButton: (parent: HTMLElement, options: GoogleIdButtonOptions) => void;
        prompt: () => void;
      };
    };
  };
}
