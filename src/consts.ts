import {
  AllowedMethods,
  PriceClass,
  SecurityPolicyProtocol,
} from '@aws-cdk/aws-cloudfront';
import * as dotenv from 'dotenv';

import * as T from './types';

dotenv.config();

// Helper function to convert environment variable collections to key:value
/**
 * Helper function to turn a collection of items in a string into an object
 *
 * @param values - string of values with delimiters. This is optional so that we can easily circuit
 *  break undefined values
 * @param objectDelimiter - the first delimiter between the key/value pairs
 * @param kvDelimiter - the second delimiter between the keys and values themselves
 *
 * @returns the constructed object from the values
 */
const stringToObject = <T extends object>(
  values?: string,
  objectDelimiter = ',',
  kvDelimiter = '=',
): T => {
  if (!values) return {} as T;
  return (values || '').split(objectDelimiter).reduce((acc: T, kv: string) => {
    const record = kv.split(kvDelimiter);
    return { ...acc, [record[0]]: record[1] };
  }, {} as T);
}

//
// METADATA
//
export const APP_NAME: string = process.env.APP_NAME as string;

// turn tag1=val1,tag2=val2 to an object
export const TAGS: T.ITags = stringToObject(process.env.TAGS || '');

//
// Route 53/Certificate Config
//
export const CERTIFICATE_ARN = process.env.CERTIFICATE_ARN;

export const ROUTE53_HOSTED_ZONE_DOMAIN =
  process.env.ROUTE53_HOSTED_ZONE_DOMAIN;

export const ROUTE53_SUBDOMAIN = process.env.ROUTE53_SUBDOMAIN;

//
// S3 Config
//
export const S3_BUCKET_NAME =
  process.env.S3_BUCKET_NAME || `${process.env.APP_NAME}-bucket`;

export const S3_CONTENT_PATH = process.env.S3_CONTENT_PATH;

export const S3_FORCE_REMOVE = !!process.env.S3_FORCE_REMOVE;

//
// Cloudfront Config
//
export const CLOUDFRONT_ALLOWED_METHODS: AllowedMethods = AllowedMethods[process.env.CLOUDFRONT_ALLOWED_METHODS as keyof typeof AllowedMethods || 'ALLOW_ALL'];

export const CLOUDFRONT_ERROR_RESPONSES: T.HttpErrorObject = stringToObject(
  process.env.CLOUDFRONT_ERROR_RESPONSES,
);

export const CLOUDFRONT_LOGGING = !!process.env.CLOUDFRONT_LOGGING;

export const CLOUDFRONT_PRICE_CLASS: PriceClass =
  PriceClass[
    (process.env.CLOUDFRONT_PRICE_CLASS as keyof typeof PriceClass) || 'PRICE_CLASS_ALL'
  ];

export const CLOUDFRONT_ROOT_OBJECT = process.env.CLOUDFRONT_ROOT_OBJECT || 'index.html';

export const CLOUDFRONT_SECURITY_POLICY: SecurityPolicyProtocol =
  SecurityPolicyProtocol[
    (process.env
      .CLOUDFRONT_SECURITY_POLICY as keyof typeof SecurityPolicyProtocol) ||
      'TLS_V1_2_2021'
  ];
