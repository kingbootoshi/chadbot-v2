[ZKMS AND SNARKS]
- Verifiable computing technologies like SNARKs can help scale blockchains by allowing untrusted entities to do processing and prove it was done correctly, without the blockchain nodes having to do all the work.

- ZKVMs (Zero-Knowledge Virtual Machines) are a type of SNARK where the statement being proven is a computer program expressed in the assembly language of a simple virtual machine. This makes ZKVMs very usable for developers.

- Historically, ZKVMs provided great developer experience but had performance overhead compared to more restrictive SNARK designs. The new ZKVM design called Jolt aims to provide both good performance and developer experience.

- Using a ZKVM pushes the surface area for bugs into the developer's high-level program rather than the complex SNARK implementation. Simplifying the SNARK improves security.

- Jolt uses the RISC-V instruction set which is small (enabling faster implementation) but can be targeted by many high-level languages. 

- Jolt leverages a technique called the Sum-check protocol to minimize the amount of expensive cryptography needed in the SNARK. This protocol went underappreciated for years.

- Advances in ZKVMs and SNARKs are coming from revisiting foundational ideas in the original theoretical literature and finding new ways to apply them, similar to the history of neural networks and AI.

- Lookup arguments, used in the Lasso SNARK and Jolt ZKVM, are analogous to memorizing times tables or logarithm tables. The prover writes out the "lookup table" once and can then just look up the answer later, which is much faster than recomputing each time.

- Unlike a regular times table, with lookup arguments the entire table doesn't need to be written out - only the parts that are actually looked up. This saves on performance.

- Traditional SNARKs force the prover to run a specific algorithm step-by-step to compute the function. Lookup arguments give the prover more flexibility in how it computes the answer, as long as it gets the right result. This allows the honest prover to be more efficient.

- Jolt currently uses elliptic curve cryptography which requires working with very large 256-bit numbers. Multiplying these is much slower than working with smaller numbers like 32-bit or 64-bit. 

- Switching Jolt to use hashing-based techniques instead of elliptic curves could provide a 10x speedup by enabling use of smaller numbers. However, this may not be as GPU-friendly.

- The Jolt prover is currently about 500,000 times slower than running the computer program natively. Bringing this overhead down through algorithmic improvements, better engineering, and eventually specialized hardware will expand the use cases for SNARKs.

- When implementing Jolt, the team found that existing libraries and tools were not optimized for the specific patterns and techniques used in Jolt. They had to implement many customizations and optimizations themselves to achieve the theoretical performance benefits.

- Optimizing the Jolt implementation involved exploiting the repeated structure and patterns in the computation, similar to how the Lasso/Jolt protocols themselves exploit the repeated structure of CPU programs. Finding and leveraging this structure is key to optimization.
[ZKMS AND SNARKS END]