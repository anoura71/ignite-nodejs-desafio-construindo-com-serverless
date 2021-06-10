import 'dotenv/config';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { checksExistingTodo } from 'src/utils/checkExistingTodo';

import { document } from '../utils/dynamodbClient';

/** Excluir uma tarefa. */
export const handle: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters;

  const todo = await checksExistingTodo(id);
  if (!todo) {
    // Tarefa não encontrada
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Todo does not exist',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Remove os dados no DynamoDB
  await document
    .delete({
      TableName: 'todos',
      Key: {
        id,
        user_id: todo.user_id,
      },
    })
    .promise();

  return {
    statusCode: 204,
    body: JSON.stringify({
      message: 'Todo successfully deleted',
    }),
    headers: {
      'Content-type': 'application/json',
    },
  };
};
