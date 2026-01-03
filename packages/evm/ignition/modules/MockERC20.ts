import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockERC20Module", (m) => {
  const erc20 = m.contract("MockERC20", ["JPY Coin", "JPYC"]);

  return { erc20 };
});
