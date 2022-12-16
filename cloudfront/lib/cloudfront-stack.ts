import { aws_route53_targets, RemovalPolicy, Stack, StackProps, } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'

export class CloudfrontStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Variable declaration
    const app_name:string = 'app-cloudfront';
    const create_year:string = String(new Date().getFullYear());
    const create_month:string =  ('0' + String(new Date().getMonth() + 1)).slice(-2);
    const app_bucket_name:string = `${app_name}-backet-${create_year}${create_month}`;
    const domain_name:string = 'DOMAIN_NAME';
    const cert_arn:string = 'CERT_ARN';
    const cfn_webacl_arn:string = 'WAFACL_ARN'

    // Create S3 bucket for logging
    const log_bucket = new s3.Bucket(this, 'LogBucket',{
      bucketName: `${app_bucket_name}-log`,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    //Create S3 bucket for App 
    const app_bucket = new s3.Bucket(this, 'AppBacket',{
      bucketName: app_bucket_name,
      enforceSSL: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      });
    
    //Create OAI account & bucket policy
    const identity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: `cloudfront OAI access for bucket: ${app_bucket_name}`, 
    });

    const canonicalUserPrincipal = new iam.CanonicalUserPrincipal(identity.cloudFrontOriginAccessIdentityS3CanonicalUserId);

    const oai_bucket_policy = new iam.PolicyStatement({
      actions:['S3:GetObject'],
      effect: iam.Effect.ALLOW,
      principals: [canonicalUserPrincipal],
      resources: [`${app_bucket.bucketArn}/*`],
    });

    app_bucket.addToResourcePolicy(oai_bucket_policy);

    //Create CloudFront Distribution

    const distribution = new cloudfront.Distribution(this, 'distribution', {
      defaultBehavior: {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new origins.S3Origin(app_bucket, {
          originAccessIdentity: identity,
        }),
      },

      enableLogging: true,
      logBucket: log_bucket,
      logFilePrefix: 'cloudfront_log',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      domainNames: [domain_name],
      certificate: acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        cert_arn,
      ),
      comment: `${app_name}-distribution`,
      defaultRootObject: 'index.html',
      webAclId: cfn_webacl_arn,

    });

    // Create host zone and A record to Route53
    // const host_zone = new route53.PublicHostedZone(this, 'HostedZone', {
    //   zoneName: 'example.com',
    // });

    // new route53.ARecord(this, 'CloudFrontARecord', {
    //   zone: host_zone,
    //   recordName: 'www',
    //   target: route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution)),

    // }) 
  }
}
