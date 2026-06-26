export const enemies=Object.freeze([
{id:'goblin',name:'Goblin',type:'melee',color:0x7fa84b,base:{hp:250,attack:28,defense:10,attackSpeed:.9,moveSpeed:82,attackRange:65},reward:{coins:38,exp:22},dropRate:.24},
{id:'goblinWarrior',name:'Goblin Warrior',type:'melee',color:0x668f38,base:{hp:390,attack:40,defense:19,attackSpeed:.78,moveSpeed:72,attackRange:70},reward:{coins:55,exp:33},dropRate:.29},
{id:'goblinArcher',name:'Goblin Archer',type:'ranged',color:0x86a65a,base:{hp:230,attack:35,defense:8,attackSpeed:1.08,moveSpeed:76,attackRange:310},reward:{coins:48,exp:29},dropRate:.27},
{id:'wolf',name:'Wolf',type:'melee',color:0xa66245,base:{hp:300,attack:34,defense:11,attackSpeed:1.15,moveSpeed:120,attackRange:70},reward:{coins:44,exp:27},dropRate:.25},
{id:'armoredWolf',name:'Armored Wolf',type:'melee',color:0x7c685d,base:{hp:480,attack:43,defense:27,attackSpeed:.95,moveSpeed:102,attackRange:75},reward:{coins:68,exp:41},dropRate:.32},
{id:'skeleton',name:'Skeleton',type:'melee',color:0xc9ced3,base:{hp:330,attack:38,defense:14,attackSpeed:.92,moveSpeed:78,attackRange:72},reward:{coins:52,exp:34},dropRate:.29},
{id:'skeletonKnight',name:'Skeleton Knight',type:'melee',color:0x8c96a8,base:{hp:590,attack:55,defense:34,attackSpeed:.75,moveSpeed:68,attackRange:78},reward:{coins:85,exp:52},dropRate:.38},
{id:'darkMage',name:'Dark Mage',type:'ranged',color:0x78509f,base:{hp:360,attack:58,defense:17,attackSpeed:.72,moveSpeed:70,attackRange:350},reward:{coins:78,exp:48},dropRate:.36}
]);
export const bosses=Object.freeze([
{id:'redDemon',name:'Red Demon',type:'boss',color:0xa53e4d,base:{hp:3200,attack:92,defense:38,attackSpeed:.7,moveSpeed:62,attackRange:105},reward:{coins:900,exp:480},dropRate:1,skill:{name:'Inferno Wave',multiplier:1.45,cooldown:8,warning:1.4}},
{id:'forestGuardian',name:'Forest Guardian',type:'boss',color:0x4f8e55,base:{hp:4600,attack:108,defense:52,attackSpeed:.62,moveSpeed:55,attackRange:115},reward:{coins:1400,exp:720},dropRate:1,skill:{name:'Ancient Roots',multiplier:1.55,cooldown:7,warning:1.6}},
{id:'skeletonKing',name:'Skeleton King',type:'boss',color:0x8d86b7,base:{hp:6200,attack:132,defense:68,attackSpeed:.66,moveSpeed:58,attackRange:120},reward:{coins:2200,exp:1000},dropRate:1,skill:{name:'Royal Cataclysm',multiplier:1.75,cooldown:6.5,warning:1.8}}
]);
export const enemyMap=Object.fromEntries([...enemies,...bosses].map(enemy=>[enemy.id,enemy]));
