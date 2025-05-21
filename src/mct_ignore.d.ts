export type MctIgnore = IgnoreReason[];

type MCT_Categories = "ITEMS" |
"LINESIZE" |
"PACKSIZE" |
"PACK" |
"JSONTAGS" |
"FORMATVER" |
"SHARING" |
"RESOURCEANIMATION" |
"TEXTURE" |
"TEXTUREREF" |
"TYPES" |
"TEXTUREIMAGE" |
"GEOMETRY" |
"SCRIPTMODULE" |
"MINENGINEVER" |
"ENTITYTYPE" |
"ITEMTYPE" |
"JSON" |
"WORLDDATA" |
"UNLINK" |
"PACKMETADATA" |
"STRICT" |
"CPI" |
"CWI" |
"VSCODEFILE" |
"BASEGAMEVER" |
"BLOCKSCAT" |
"UNKJSON" |
"WORLD" |
"UNKFILE" |
"VALFILE" |
"PATHLENGTH" |
"NOBOM";

interface IgnoreReason {
    description: string;
    category: MCT_Categories;
    path: string;
}