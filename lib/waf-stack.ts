import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export class WafStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const waf_scope = 'CLOUDFRONT';
    const cfnWebACL = new wafv2.CfnWebACL(this, 'WebACL', {
      defaultAction: {
        block: {
        }
      },
      name: 'waf-web-acl',
      scope: waf_scope,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'waf-web-acl',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          priority: 0,
          name: 'country-rule-set',
          action: { allow: {}},
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: 'country-rule-set',
          },
          statement: {
            geoMatchStatement: {
              countryCodes: ['JP'],
            },
          },
        },
      ]
    })
  };
};
