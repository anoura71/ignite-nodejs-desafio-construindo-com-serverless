import { IUser } from 'src/interfaces/IUser';

import { document } from './dynamodbClient';

/** Verificar se o usuário está cadastrado. */
export async function checksExistingUser(user_id: string): Promise<IUser> {
  // Verifica se o user_id está cadastrado
  const response = await document
    .query({
      TableName: 'users',
      KeyConditionExpression: 'id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': user_id,
      },
    })
    .promise();
  const user = response.Items[0] as IUser;

  return user;
}
