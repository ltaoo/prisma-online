declare namespace Extensions_2 {
  export //     InternalArgs,
  //     Args_3 as Args,
  //     DefaultArgs,
  //     GetResult,
  //     GetSelect,
  //     GetModel,
  //     GetClient,
  //     ReadonlySelector,
  //     RequiredArgs as UserArgs,
   type {};
}
declare interface PrismaPromise_2<T> extends Promise<T> {
  [Symbol.toStringTag]: "PrismaPromise";
}

declare namespace Public {
  export type {
    //     Args_4 as Args,
    //     Result,
    //     Payload_2 as Payload,
    PrismaPromise_2 as PrismaPromise,
    //     Operation,
    //     Exact,
  };
}

declare namespace Types {
  export {
    Extensions_2 as Extensions,
    //     Utils,
    Public,
    //     type GetResult_2 as GetResult,
    //     type GetFindResult,
    //     type Payload,
  };
}

declare namespace Prisma {
  // export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = Types.Public.PrismaPromise<T>;
}
