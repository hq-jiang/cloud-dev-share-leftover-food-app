import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Item } from  '../models/Item'
// import { TodoUpdate } from  '../models/TodoUpdate'

const AWS = require('aws-sdk')
const AWSX = useAWSX()

const TABLENAME : string = process.env.ITEMS_TABLE;
// const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
const logger = createLogger('dataLayer-itemsAccess')

export class ItemsAccess {
  constructor(
    private readonly documentClient: DocumentClient = createDocumentClient(),
  ) {}
   
  

  async createItem(item : Item): Promise<Item> {
    const params = {
      TableName : TABLENAME,
      Item: item
    }
      
    logger.info('Uploading new item to database')
    await this.documentClient.put(params).promise()
    return item
  }

  // async getUserItems() : Promise<any>{
  //   const params = {
  //     TableName: process.env.TODOS_TABLE,
  //     IndexName: process.env.INDEX_NAME,
  //     KeyConditionExpression: 'userId = :loggedInUser',
  //     ExpressionAttributeValues: {
  //       ':loggedInUser': userId,
  //     }
  //   }
  //   const todos = await this.documentClient.query(params).promise()
  //   logger.info('Get all todos', todos)
  //   return todos
  // }

  async getFeed() : Promise<any>{
    var params = {
      TableName : TABLENAME,
    }
    const items = await this.documentClient.scan(params).promise()
    logger.info('Get all items', items)
    return items
  }

  async deleteItem(itemId : string): Promise<any> {
    // First find the createdAt field for the item, since it is part of the composite key
    const paramsGet = {
      TableName: TABLENAME,
      KeyConditionExpression: 'itemId = :itemIddelete',
      ExpressionAttributeValues: {
        ':itemIddelete': itemId,
      }
    }
    console.log(paramsGet)
    logger.info('getting item')
    const item = await this.documentClient.query(paramsGet).promise()
    logger.info('retrieved item', item)

    const paramsDelete = {
      TableName : TABLENAME,
      Key: {
        itemId: itemId,
        createdAt: item.Items[0].createdAt
      }
    };
    logger.info('deleting item', item)
    await this.documentClient.delete(paramsDelete).promise()
    logger.info('item deleted', item)
    return item
  }



  // async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate>{
  //   const paramsGet = {
  //     TableName: process.env.TODOS_TABLE,
  //     KeyConditionExpression: 'todoId = :todoIddelete',
  //     ExpressionAttributeValues: {
  //       ':todoIddelete': todoId,
  //     }
  //   }
  //   const todo = await this.documentClient.query(paramsGet).promise()
  
  //   var params = {
  //     TableName: process.env.TODOS_TABLE,
  //     Key: { 
  //       todoId : todoId, 
  //       createdAt: todo.Items[0].createdAt 
  //     },
  //     UpdateExpression: 'set #name = :updatedName, #dueDate = :updatedDueDate, #done = :updatedDone',
  //     ExpressionAttributeNames: {'#name' : 'name', '#dueDate': 'dueDate', '#done': 'done'},
  //     ExpressionAttributeValues: {
  //       ':updatedName' : updatedTodo.name,
  //       ':updatedDueDate' : updatedTodo.dueDate,
  //       ':updatedDone' : updatedTodo.done,
  //     }
  //   };
  
  //   await this.documentClient.update(params).promise();
    
  //   return updatedTodo
  // }

  // async updateAttachmentUrl(todoId: string) {
  //   const paramsGet = {
  //     TableName: process.env.TODOS_TABLE,
  //     KeyConditionExpression: 'todoId = :toUpdate',
  //     ExpressionAttributeValues: {
  //       ':toUpdate': todoId,
  //     }
  //   }
  //   const todo = await this.documentClient.query(paramsGet).promise()
  //   logger.info('get todo', todo)

  //   const url = `https://${s3BucketName}.s3.eu-central-1.amazonaws.com/${todoId}`
  
  //   var params = {
  //     TableName: process.env.TODOS_TABLE,
  //     Key: { 
  //       todoId : todoId, 
  //       createdAt: todo.Items[0].createdAt 
  //     },
  //     UpdateExpression: 'set #attachmentUrl = :updatedUrl',
  //     ExpressionAttributeNames: {'#attachmentUrl' : 'attachmentUrl'},
  //     ExpressionAttributeValues: {
  //       ':updatedUrl' : url
  //     }
  //   }
  //   await this.documentClient.update(params).promise();
    
  //   return url
  // }
}

function createDocumentClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Create a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new AWSX.DynamoDB.DocumentClient()
  }
}

function useAWSX() {
  // Disable AWS-XRAY in local mode to prevent runtime error
  if (process.env.IS_OFFLINE) {
    return undefined
  } else {
    const AWSXRay = require('aws-xray-sdk')
    const AWSX = AWSXRay.captureAWS(AWS)
    return AWSX
  }
}