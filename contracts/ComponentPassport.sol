// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ComponentPassport {
    
    // Roller için struct yapısı
    enum Role { None, Manufacturer, Distributor, Factory }
    enum Status { Produced, InTransit, Mounted, Scrapped, Recalled }

    // Çipin tüm detaylarını tutan ana veri yapısı (Anayasa)
    struct Component {
        string partNumber;
        string batchNo;
        string productionFacility;
        uint256 productionDate;
        string qualityTest;
        address currentOwner;
        Status status;
        string associatedPcbId;
    }

    // Adreslerin hangi role sahip olduğunu tutan mapping
    mapping(address => Role) public roles;
    
    // Çipin SHA-256 Hash'ini (QR Verisini) Component detaylarına bağlayan mapping
    mapping(bytes32 => Component) private components;
    
    // Bir hash'in sistemde kayıtlı olup olmadığını hızlıca kontrol etmek için
    mapping(bytes32 => bool) public isRegistered;

    // Kontratı deploy eden kişi (Admin)
    address public admin;

    // Log takibi için Event'ler (Frontend dinleyebilir)
    event RoleAssigned(address indexed account, Role role);
    event ComponentRegistered(bytes32 indexed chipHash, string partNumber, address indexed manufacturer);
    event OwnershipTransferred(bytes32 indexed chipHash, address indexed from, address indexed to);
    event ComponentStatusUpdated(bytes32 indexed chipHash, Status status, string pcbId);

    modifier OnlyAdmin() {
        require(msg.sender == admin, "Yetki Hatasi: Sadece Admin bu islemi yapabilir.");
        _;
    }

    modifier OnlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Yetki Hatasi: Bu islem icin rolunuz yetersiz.");
        _;
    }

    constructor() {
        admin = msg.sender;
        // Kontratı kuran admini şimdilik üretici olarak da atayalım test kolaylığı için
        roles[msg.sender] = Role.Manufacturer;
    }

    // 1. ROL ATAMA FONKSİYONU (Sadece Admin firmaları sisteme ekler)
    function assignRole(address _account, Role _role) external OnlyAdmin {
        roles[_account] = _role;
        emit RoleAssigned(_account, _role);
    }

    // 2. ÜRETİCİ İÇİN: KOMPONENT KAYDETME (Register)
    // frontend'den veya backend'den SHA-256 hash'i (bytes32 formatında) parametre olarak gelecek
    function registerComponent(
        bytes32 _chipHash,
        string memory _partNumber,
        string memory _batchNo,
        string memory _productionFacility,
        string memory _qualityTest
    ) external OnlyRole(Role.Manufacturer) {
        require(!isRegistered[_chipHash], "Hata: Bu komponent zaten sisteme kayitli!");

        components[_chipHash] = Component({
            partNumber: _partNumber,
            batchNo: _batchNo,
            productionFacility: _productionFacility,
            productionDate: block.timestamp,
            qualityTest: _qualityTest,
            currentOwner: msg.sender,
            status: Status.Produced,
            associatedPcbId: "None"
        });

        isRegistered[_chipHash] = true;
        emit ComponentRegistered(_chipHash, _partNumber, msg.sender);
    }

    // 3. DİSTRİBÜTÖR VEYA ÜRETİCİ İÇİN: MÜLKİYET TRANSFERİ
    function transferOwnership(bytes32 _chipHash, address _to) external {
        require(isRegistered[_chipHash], "Hata: Komponent bulunamadi.");
        require(components[_chipHash].currentOwner == msg.sender, "Hata: Bu komponentin sahibi siz degilsiniz.");
        require(_to != address(0), "Hata: Gecersiz cuzdan adresi.");

        address previousOwner = components[_chipHash].currentOwner;
        components[_chipHash].currentOwner = _to;
        
        // Eğer mülkiyeti alan bir fabrika (örn: ASELSAN) ise statüyü InTransit yapalım
        if (roles[_to] == Role.Factory || roles[_to] == Role.Distributor) {
            components[_chipHash].status = Status.InTransit;
        }

        emit OwnershipTransferred(_chipHash, previousOwner, _to);
    }

    // 4. FABRİKA (MONTAJ) İÇİN: KARTA MONTE ETME VE DURUM GÜNCELLEME
    function mountToPcb(bytes32 _chipHash, string memory _pcbId) external OnlyRole(Role.Factory) {
        require(isRegistered[_chipHash], "Hata: Komponent bulunamadi.");
        require(components[_chipHash].currentOwner == msg.sender, "Hata: Ilgili parca sizin envanterinizde degil.");
        
        components[_chipHash].status = Status.Mounted;
        components[_chipHash].associatedPcbId = _pcbId;

        emit ComponentStatusUpdated(_chipHash, Status.Mounted, _pcbId);
    }

    // 5. ACİL DURUM: ÜRETİCİ İÇİN GERİ ÇAĞIRMA (RECALL)
    function recallComponent(bytes32 _chipHash) external OnlyRole(Role.Manufacturer) {
        require(isRegistered[_chipHash], "Hata: Komponent bulunamadi.");
        components[_chipHash].status = Status.Recalled;
        emit ComponentStatusUpdated(_chipHash, Status.Recalled, "None");
    }

    // 6. HERKES İÇİN: QR HASH SORGULAMA (Verify)
    // view fonksiyonudur, gaz ücreti harcamaz.
    function verifyComponent(bytes32 _chipHash) external view returns (Component memory) {
        require(isRegistered[_chipHash], "Hata: Gecersiz QR kod veya sahte komponent!");
        return components[_chipHash];
    }
}