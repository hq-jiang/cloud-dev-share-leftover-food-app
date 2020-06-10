import { CreateItemRequest } from '../requests/CreateItemRequest'
import { ItemsAccess } from '../dataLayer/itemsAccess'
import { Item } from '../models/Item'
import { v4 } from 'uuid';
import { createLogger } from '../utils/logger';
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('BusinessLogic-todo')

const itemsAccess = new ItemsAccess()

export async function getFeed(): Promise<any>{
  logger.info('Query db for todos')

  const todos = await itemsAccess.getFeed()
  return todos
}

export async function createItem(newItem: CreateItemRequest, userId: string): Promise<Item> {

    const item: Item = {
        ...newItem,
        userId: userId,
        itemId: v4(),
        createdAt: new Date().toISOString(),
      }
      logger.info('New item instantiated', item)
    
      await itemsAccess.createItem(item)

    return item
}

// export async function deleteTodo(todoId: string): Promise<any>{
  
//   const todo = await todosAccess.deleteTodo(todoId)
//   return todo
// }

// export async function getTodos(userId: string): Promise<any>{
//   logger.info('Query db for todos')

//   const todos = await todosAccess.getTodos(userId)
//   return todos
// }

// export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest) {
//   logger.info('update body', updatedTodo)
//   const updateditem = await todosAccess.updateTodo(todoId, updatedTodo)
//   return updateditem
// }

// export async function updateAttachmentUrl(todoId: string): Promise<string> {
//   logger.info('update attachmentUrl')
//   const attachmentUrl = await todosAccess.updateAttachmentUrl(todoId)
//   logger.info('attachmentUrl', attachmentUrl)
//   return attachmentUrl
// }