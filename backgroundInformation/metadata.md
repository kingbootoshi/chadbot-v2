How to add metadata to inscriptions? What is metadata?
Inscriptions may include CBOR metadata, stored as data pushes in fields with tag 5. Since data pushes are limited to 520 bytes, metadata longer than 520 bytes must be split into multiple tag 5 fields, which will then be concatenated before decoding. 
Learn more: https://docs.ordinals.com/inscriptions/metadata.html