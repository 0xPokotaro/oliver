import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: [
        'introduction/about',
        'introduction/glossary',
      ],
    },
    {
      type: 'category',
      label: 'Core Features',
      link: {
        type: 'doc',
        id: 'core-features/index',
      },
      items: [
        'core-features/ai-agent',
        'core-features/x402-protocol',
        'core-features/gasless-payment',
        'core-features/headless-commerce',
        'core-features/security',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/system-overview',
        {
          type: 'category',
          label: 'The 2-Layer Agent Model',
          items: [
            'architecture/layer1-orchestrator',
            'architecture/layer2-specialist',
          ],
        },
        {
          type: 'category',
          label: 'The x402 Protocol',
          items: [
            'architecture/gatekeeper-model',
            'architecture/transaction-flow',
            'architecture/facilitator-gasless',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Protocol Specification',
      items: [
        {
          type: 'category',
          label: 'HTTP Standards',
          items: [
            'protocol/http-402',
            'protocol/x-payment-header',
          ],
        },
        {
          type: 'category',
          label: 'Ethereum Standards (EIPs)',
          items: [
            'protocol/eip-712-intent',
            'protocol/eip-2612-permit',
            'protocol/erc-4337-1271',
          ],
        },
        {
          type: 'category',
          label: 'Security & Governance',
          items: [
            'protocol/erc-8004-logic',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Developer Guide',
      items: [
        'developer-guide/gadget-configuration',
        'developer-guide/gadget-operation',
        {
          type: 'category',
          label: 'For Agent Builders',
          items: [
            'developer-guide/agent-builders/building-layer2-module',
            'developer-guide/agent-builders/wallet-integration',
          ],
        },
        {
          type: 'category',
          label: 'API Reference',
          items: [
            'developer-guide/api-reference/common-reference',
            'developer-guide/api-reference/api-specification',
            'developer-guide/api-reference/user-information-api',
          ],
        },
        {
          type: 'category',
          label: 'For Merchants',
          items: [
            'developer-guide/merchants/getting-started',
            'developer-guide/merchants/middleware-sdk',
            'developer-guide/merchants/mock-server-tutorial',
            'developer-guide/merchants/implementation-workflow',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Use Cases',
      items: [
        'use-cases/physical-replenishment',
        'use-cases/on-demand-workforce',
        'use-cases/digital-resources',
      ],
    },
    {
      type: 'category',
      label: 'Roadmap',
      items: [
        'roadmap/phase1-poc',
        'roadmap/phase2-smart-accounts',
        'roadmap/phase3-global-infrastructure',
      ],
    },
  ],
};

export default sidebars;
