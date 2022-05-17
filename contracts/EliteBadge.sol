// contracts/EliteBadge.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Base64.sol";

contract EliteBadge is ERC721 {

    constructor() ERC721("Web3Elite","WE") {
    }

    function mintTo(uint256 tokenId) public {
        require(tokenId < 1000, "invalid tokenId");
        require(_exists(tokenId)==false, "tokenId already exist");
        _mint(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId) override public pure returns (string memory) {
        string[3] memory parts;

        parts[0] = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 200px; }</style><rect width='100%' height='100%' fill='deepblue' /><text x='50%' y='230' class='base' text-anchor='middle'>";

        parts[1] = Strings.toString(tokenId);

        parts[2] = "</text></svg>";

        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            "{\"name\":\"WE #", 
            Strings.toString(tokenId), 
            "\",\"description\":\"Web3 Elite Badge by Huoda Education.\",",
            "\"image\": \"data:image/svg+xml;base64,", 
            // Base64.encode(bytes(output)), 
            Base64.encode(bytes(abi.encodePacked(parts[0], parts[1], parts[2]))),     
            "\"}"
            ))));
            
        return string(abi.encodePacked("data:application/json;base64,", json));
    }    
}
