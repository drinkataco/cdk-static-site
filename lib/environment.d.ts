/* eslint-disable no-unused-vars */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_NAME: string;
      CERTIFICATE_ARN?: string,
      CLOUDFRONT_ALLOWED_METHODS?: string;
      CLOUDFRONT_ERROR_RESPONSES: string;
      CLOUDFRONT_GEO_DENYLIST?: string;
      CLOUDFRONT_LOGGING?: number;
      CLOUDFRONT_PRICE_CLASS?: string;
      CLOUDFRONT_ROOT_OBJECT?: string;
      CLOUDFRONT_FUNCTIONS_REQUEST?: string;
      CLOUDFRONT_FUNCTIONS_RESPONSE?: string;
      ROUTE53_HOSTED_ZONE_DOMAIN?: string;
      ROUTE53_SUBDOMAIN?: string;
      S3_BUCKET_NAME?: string;
      S3_CONTENT_PATH?: string;
      DOCKER_S3_CONTENT_PATH?: string;
      S3_FORCE_REMOVE?: number;
      S3_CACHE_CONTROL?: string;
      TAGS?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
