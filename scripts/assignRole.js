import hre from "hardhat";
console.log("Contract Address:", await contract.getAddress());

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("İşlem yapan cüzdan:", deployer.address);

  const contract = await hre.ethers.getContractAt(
    "ComponentPassport",
    "0x04a249031829C0Da84aD67E7C25AbCd271389a02"
  );

  const currentRole = await contract.roles(deployer.address);
  console.log("Mevcut rol:", currentRole.toString());

  const tx = await contract.assignRole(deployer.address, 1);
  await tx.wait();
  
  console.log("✅ Manufacturer rolü verildi!");
  
  const newRole = await contract.roles(deployer.address);
  console.log("Yeni rol:", newRole.toString());
}

main().catch(console.error);