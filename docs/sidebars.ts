import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: '1. Introduction (はじめに)',
      items: [
        'introduction/welcome',
        {
          type: 'category',
          label: 'Core Philosophy',
          items: [
            'introduction/payment-redefined',
            'introduction/ai-redefined',
          ],
        },
        'introduction/glossary',
      ],
    },
    {
      type: 'category',
      label: '2. Architecture (アーキテクチャ)',
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
      label: '3. Protocol Specification (プロトコル仕様)',
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
      label: '4. Developer Guide (開発者ガイド)',
      items: [
        {
          type: 'category',
          label: 'For Merchants (サービス提供者向け)',
          items: [
            'developer-guide/merchants/getting-started',
            'developer-guide/merchants/middleware-sdk',
            'developer-guide/merchants/mock-server-tutorial',
          ],
        },
        {
          type: 'category',
          label: 'For Agent Builders (エージェント開発者向け)',
          items: [
            'developer-guide/agent-builders/building-layer2-module',
            'developer-guide/agent-builders/wallet-integration',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '5. Use Cases (ユースケース)',
      items: [
        'use-cases/physical-replenishment',
        'use-cases/on-demand-workforce',
        'use-cases/digital-resources',
      ],
    },
    {
      type: 'category',
      label: '6. Roadmap (ロードマップ)',
      items: [
        'roadmap/phase1-poc',
        'roadmap/phase2-smart-accounts',
        'roadmap/phase3-global-infrastructure',
      ],
    },
  ],
};

export default sidebars;
