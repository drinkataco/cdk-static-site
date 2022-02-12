import {
  Construct,
  Stack,
  StackProps,
  RemovalPolicy,
} from '@aws-cdk/core';
import { OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';

/**
 * Configurable options for stack as properties
 */
interface S3StackProps extends StackProps {
  /** The name of our S3 Bucket */
  bucketName: string;
  /**
   * The source information of our bucket.
   */
  bucketSource: {
    /** local path of files to upload to S3 */
    path: string;
  };
  /**
   * Whether we want create a DANGEROUS force remove of our S3 bucket.
   * This will force delete all objects and the bucket
   */
  forceRemove?: boolean;
}

/**
 * Default Properties
 */
const defaultProps: Partial<S3StackProps> = {
  forceRemove: false,
};

/**
 * A Stack for an S3 Bucket to be used by cloudfront to serve a static website
 */
class S3Stack extends Stack {
  /**
   * Our AWS S3 Bucket object
   */
  private bucket: Bucket;

  /**
   * Our stack properties
   */
  private props: S3StackProps;

  /**
   * Our access policy for the bucket and cloudfront
   */
  private originAccessIdentity: OriginAccessIdentity;

  constructor(scope: Construct, private id: string, props: S3StackProps) {
    super(scope, id, props);

    this.props = {
      ...defaultProps,
      ...props,
    };

    this.originAccessIdentity = this.createOriginAccessIdentity();
    this.bucket = this.createBucket();
  }

  /**
   * Create Our S3 Bucket with our default options here
   * The bucket will NOT be publically accessible as per cloudformation defaults
   */
  private createBucket(): Bucket {
    const bucket = new Bucket(this, this.props.bucketName, {
      /** The unique S3 bucket name */
      bucketName: this.props.bucketName,
      /**
       * On CDK destroy, we'll keep the bucket unless forceRemove is set to true. This is because
       * if the bucket isn't empty, it will error
       */
      removalPolicy:
        this.props.forceRemove === true
          ? RemovalPolicy.DESTROY
          : RemovalPolicy.RETAIN,
      /**
       * Working in unison with removalPolicy, we will empty the bucket first if forceRemove is
       * true
       */
      autoDeleteObjects: !!this.props.forceRemove,
    });

    bucket.grantRead(this.getOriginAccessIdentity());

    return bucket;
  }

  /**
   * Create Origin Access Identity for S3 Bucket and Cloudfront
   */
  private createOriginAccessIdentity(): OriginAccessIdentity {
    return new OriginAccessIdentity(this, this.id, {
      comment: `OriginAccessIdentity for S3 Bucket '${this.props.bucketName}'`,
    });
  }

  /**
   * Get the bucket object
   */
  public getBucket(): Bucket {
    return this.bucket;
  }

  /**
   * Get Origin Access Identity Object
   */
  public getOriginAccessIdentity(): OriginAccessIdentity {
    return this.originAccessIdentity;
  }

  /**
   * Call the operation to deploy our static site to S3
   */
  public deploy() {
    if (this.props.bucketSource?.path) {
      new BucketDeployment(this, `${this.id}-bucket-deployment`, {
        sources: [Source.asset(this.props.bucketSource.path)],
        destinationBucket: this.getBucket(),
      });
    }
  }
}

export default S3Stack;
