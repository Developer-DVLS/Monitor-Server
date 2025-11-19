export interface Site {
  backend_url: string;
  code_name: string;
  created_date: string;
  frontend_url: string;
  id: number;
  location: string;
  logo: string;
  name: string;
  updated_date: string;
  verification_phone_number: string;
}

export interface SiteStatus {
  site: Site;
  frontendUp: boolean;
  backendUp: boolean;
  lastChecked: Date;
  consecutiveFailures: number;
}
