import hre from "hardhat";

async function main() {
  console.log("ComponentPassport kontrati deploy ediliyor...");

  const ComponentPassport = await hre.ethers.getContractFactory("ComponentPassport");
  const contract = await ComponentPassport.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("\n==================================================");
  console.log(`🎉 KONTRAT BAŞARIYLA DEPLOY EDİLDİ!`);
  console.log(`📌 Kontrat Adresi: ${contractAddress}`);
  console.log("==================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});