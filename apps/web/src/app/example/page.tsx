'use client';

import { z } from 'zod';
import { useState } from "react";
import { client } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@privy-io/react-auth";
import { CONTRACT_ADDRESSES } from '@oliver/shared/configs';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';

const PaymentResponseSchema = z.object({
  error: z.string(),
  accepts: z.array(z.object({
    scheme: z.string(),
    network: z.string(),
    maxAmountRequired: z.string(),
    resource: z.string(),
    description: z.string(),
    mimeType: z.string(),
    payTo: z.string(),
    maxTimeoutSeconds: z.number(),
    asset: z.string(),
    outputSchema: z.object({
      input: z.object({
        type: z.string(),
        method: z.string(),
        discoverable: z.boolean(),
      })
    }),
    extra: z.object({
      name: z.string(),
      version: z.string(),
    })
  })),
  x402Version: z.number(),
})

type PaymentResponse = z.infer<typeof PaymentResponseSchema>;

const PaymentHeaderSchema = z.object({
  x402Version: z.number(),
  scheme: z.string(),
  network: z.string(),
  payload: z.object({
    signature: z.string(),
    authorization: z.object({
      from: z.string(),
      to: z.string(),
      value: z.string(),
      validAfter: z.string(),
      validBefore: z.string(),
      nonce: z.string(),
    })
  })
})

export default function ExamplePage() {
  const [data, setData] = useState<PaymentResponse | null>(null);
  const [data2, setData2] = useState<any>(null);

  const { wallets } = useWallets();

  const handleClick = async () => {
    try {
      console.log("clicked");
      const response = await client.api.payments.$post({
        header: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: {
          message: "Hello, world!",
        },
      });

      const json = await response.json();
      const parsed = PaymentResponseSchema.parse(json);
      console.log(parsed);
      setData(parsed);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick2 = async () => {
    try {
      const wallet = wallets.find((wallet) => wallet.address);

      if (!wallet) {
        throw new Error("No wallet");
      }

      if (!data) {
        throw new Error("No data");
      }

      // 1. Client receives 402 response with payment requirements
      const paymentReq = data?.accepts[0]

      // 2. Client creates authorization object
      const authorization = {
        from: wallet.address as `0x${string}`,
        to: paymentReq.payTo as `0x${string}`,
        value: paymentReq.maxAmountRequired,
        validAfter: (Math.floor(Date.now() / 1000) - 300).toString(),
        validBefore: (Math.floor(Date.now() / 1000) + 300).toString(), // 5 minutes
        nonce: ethers.hexlify(ethers.randomBytes(32)) as `0x${string}`
      }

      // 3. User signs authorization
      // Get EIP-1193 provider from Privy wallet
      const provider = await wallet.getEthereumProvider();
      
      // Create WalletClient
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
      });

      // Define EIP-712 domain for EIP-3009
      const domain = {
        name: "JPY Coin",
        version: "1",
        chainId: baseSepolia.id,
        verifyingContract: CONTRACT_ADDRESSES.BASE_SEPOLIA.JPYC,
      };

      // Define EIP-712 types for TransferWithAuthorization
      const types = {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      };

      // Sign the authorization using EIP-712
      const signature = await walletClient.signTypedData({
        account: wallet.address as `0x${string}`,
        domain,
        types,
        primaryType: "TransferWithAuthorization",
        message: {
          from: authorization.from,
          to: authorization.to,
          value: authorization.value,
          validAfter: authorization.validAfter,
          validBefore: authorization.validBefore,
          nonce: authorization.nonce as `0x${string}`,
        },
      });

      // 4. Client creates payment payload
      const paymentPayload = {
        x402Version: 1,
        scheme: paymentReq.scheme,
        network: paymentReq.network,
        payload: {
          signature: signature,
          authorization: authorization
        }
      };

      // 5. Base64 encode and send
      const encoded = btoa(JSON.stringify(paymentPayload));

      const response = await client.api.payments.$post({
        header: {
          Authorization: `Bearer ${await getAccessToken()}`,
          'X-PAYMENT': encoded,
        },
        body: {
          message: "Hello, world!",
        },
      });
      const json = await response.json();
      console.log(json);
      setData2(json);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Button onClick={handleClick}>Click me</Button>
      <div className="mt-4">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      <Button onClick={handleClick2}>Click me 2</Button>
      <div className="mt-4">
        <pre>{JSON.stringify(data2, null, 2)}</pre>
      </div>
    </div>
  );
}
