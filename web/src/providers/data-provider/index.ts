import dataProvider from "@refinedev/hasura";
import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient(process.env.NEXT_PUBLIC_HASURA_URL!, {
  headers: {
    "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET!,
  },
});

export const hasuraDataProvider = dataProvider(client, {
  namingConvention: "hasura-default",
  idType: "uuid",
});