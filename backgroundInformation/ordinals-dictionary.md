[ORDINALS DICTIONARY]

Ordinals Protocol ◉
The Ordinals Protocol allows for the inscription of data onto the Bitcoin blockchain and the attachment of that data to specific satoshis, effectively turning them into bitcoin-native digital artifacts. Ordinals Theory refers to the concept and principles behind the numbering and tracking of satoshis on the Bitcoin blockchain. It is the theoretical framework that underpins the entire Ordinals system.
Learn more: https://docs.ordinals.com/introduction.html

Ordinals ◉
Ordinals are a numbering scheme for satoshis that allows tracking and transferring individual sats. These numbers are called ordinal numbers. Satoshis are numbered in the order in which they're mined, and transferred.
Learn more: https://docs.ordinals.com/overview.html

Inscription ◉
An Inscription refers to a digital artifact or NFT that is created by attaching (inscribing) data directly onto a Bitcoin satoshi. It allows for ownership and trading of unique digital assets on the BTC blockchain.
Learn more: https://docs.ordinals.com/inscriptions.html

Digital Artifacts ◉
A digital artifact in Ordinals is a secure, unchangeable digital object with an owner, stored on the Bitcoin blockchain as NFTs through inscriptions, enabling ownership and trading.
Learn more: https://docs.ordinals.com/digital-artifacts.html

Satoshis (sats) ◉
Satoshis, not bitcoin, are the atomic, native currency of the Bitcoin network. One bitcoin can be sub-divided into 100,000,000 satoshis, but no further.
Learn more: https://docs.ordinals.com/introduction.html

Sat Rarity ◉
Bitcoin has periodic events, some frequent, some more uncommon, and these naturally lend themselves to a system of rarity depending on the time the satoshis were mined.

Learn more: https://twitter.com/const_quary/status/1674040726777151488?s=20

Sat Name & Number ◉
Each satoshi has a name, consisting of the letters A through Z, that get shorter over time, they also have a number assigned according to the order in which the satoshi was mined aka Ordinals number.
Learn more: https://docs.ordinals.com/overview.html

UTXO's ◉
UTXOs, or Unspent Transaction Outputs in Bitcoin replace traditional account balances by tracking every unspent Bitcoin from past transactions, indicating what can be spent from your wallet.
Learn more: https://twitter.com/ItsFranken/status/1671807110244610048?s=20

Inscription Number ◉
The number assigned to an Inscription based on it's order of creation on the network, pretty straight forward.
Early Inscription are very valuable for collectors!

PSBT's ◉
Partially signed bitcoin transactions (PSBT's) can be compared to collaborating on a document online, but this doc is your transaction.
Very essential feature for many platforms building in this ecosystem.
Learn more: https://twitter.com/LiquidiumFi/status/1669076008031641600?s=20

Recursion ◉
Recursion solves the maximum file size bottleneck *and* reduces cost.
It also allows you to split up your work across multiple inscriptions or lets you re-use past Inscriptions.
Learn more: https://twitter.com/huuep/status/1672643149267877894

Reinscriptions ◉
Re-inscriptions in Ordinals refer to the ability to inscribe on a satoshi that has already been inscribed on. It adds a new layer of inscription without changing or replacing the original inscription. As inscriptions are immutable, and cannot be changed once inscribed, reinscription stacks multiple inscriptions on a single satoshi.
This means you can have one satoshi that has multiple inscriptions on it! You absolutely can re-inscribe on a satoshi that has already been inscribed on by another user.
Learn more here:
https://open.spotify.com/episode/637yw4PbxOZwWCvMtp9vhL

Bitcoin Node ◉
A Bitcoin node is a computer or device running software that participates in the Bitcoin network. It plays a crucial role in maintaining the network's integrity and security by performing various functions.
Learn more: https://twitter.com/krakenfx/status/1549822184884936707?s=20

Indexer ◉
In the context of blockchain and cryptocurrency, an indexer is a software component or service that scans and analyzes the data stored on a blockchain to make it easily searchable and accessible.
Learn more: https://docs.ordinals.com/guides/reindexing.html

Taproot / SegWit ◉
The Segregated Witness (SegWit) and Taproot upgrade is a significant improvement to the Bitcoin blockchain's protocol, aimed at enhancing its efficiency, privacy, and functionality.
Learn more: https://ratecity.com.au/cryptocurrency/articles/what-is-the-bitcoin-taproot

Teleburning ◉
Casey Rodarmor came up with the concept of Teleburn as a troll on ETH & a logically sound & simple way to permanently move assets from ETH to BTC.
"Burn w/ immutable pointer to inscription or ordinal"
More: https://twitter.com/TO/status/1667658012960464897?s=20


Cursed Inscriptions ◉
Inscriptions that did NOT receive an inscription # due to a bug in the protocol and weren't recognized by indexers.
Learn more: https://twitter.com/billyrestey/status/1661406587511271424?s=20

DLC's ◉
Discreet Log Contracts facilitate conditional (if/then) statements for Bitcoin payments between two parties.
Learn more: https://twitter.com/hirowallet/status/1684616932388204544

Sat Hunting ◉
Want to find special sats in your wallet ?
There are sites like Magisat.io (https://twitter.com/Magisat_io) & Sating.io (https://twitter.com/satingio) that allow you to input your BTC address and scan your wallet for special sats.

If you wish for manual sat control via Sparrow in order to extract these sats, you must use the ord client that is indexed with sats or follow these sat hunting guides made by goated community member Franken: 
- Part1: https://twitter.com/ItsFranken/status/1634186660220121088
- Part2: https://twitter.com/ItsFranken/status/1639202586074152969

Ord Client ◉
At the heart of the Ordinal Protocol is the ord client, an open source software run by users, it completes some of the most crucial tasks such as indexing, assigning ordinal nubers & more.
https://twitter.com/ItsFranken/status/1694658442504626569?s=20

Envelopes ◉
An Inscription gets broken up into small parts so that it can go onto Bitcoin, but we "package" all those parts together in an "envelope".
Learn more: https://blog.ordinalhub.com/what-is-an-envelope/

Delegate ◉
Inscriptions may nominate a delegate inscription. Requests for the content of an inscription with a delegate will instead return the content and content type of the delegate. This can be used to cheaply create copies of an inscription.
Learn more: https://docs.ordinals.com/inscriptions/delegate.html

Metadata ◉
Inscriptions may include CBOR metadata, stored as data pushes in fields with tag 5. Since data pushes are limited to 520 bytes, metadata longer than 520 bytes must be split into multiple tag 5 fields, which will then be concatenated before decoding.
Learn more: https://docs.ordinals.com/inscriptions/metadata.html

Pointer ◉
In order to make an inscription on a sat other than the first of its input, a zero-based integer, called the "pointer", can be provided with tag 2, causing the inscription to be made on the sat at the given position in the outputs. If the pointer is equal to or greater than the number of total sats in the outputs of the inscribe transaction, it is ignored, and the inscription is made as usual. The value of the pointer field is a little endian integer, with trailing zeroes ignored.
An even tag is used, so that old versions of ord consider the inscription to be unbound, instead of assigning it, incorrectly, to the first sat.
This can be used to create multiple inscriptions in a single transaction on different sats, when otherwise they would be made on the same sat.
Learn more: https://docs.ordinals.com/inscriptions/pointer.html

Provenance/Parent-Child Inscriptions ◉ 
The owner of an inscription can create child inscriptions, trustlessly establishing the provenance of those children on-chain as having been created by the owner of the parent inscription. This can be used for collections, with the children of a parent inscription being members of the same collection.
Children can themselves have children, allowing for complex hierarchies. For example, an artist might create an inscription representing themselves, with sub inscriptions representing collections that they create, with the children of those sub inscriptions being items in those collections.
Learn more: https://docs.ordinals.com/inscriptions/provenance.html

Recursion ◉ 
An important exception to sandboxing is recursion. Recursive endpoints are whitelisted endpoints that allow access to on-chain data, including the content of other inscriptions.
Learn more: https://docs.ordinals.com/inscriptions/recursion.html