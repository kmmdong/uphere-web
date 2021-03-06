import { combineReducers } from 'redux';

import {
  REQUEST_LOGIN_STATUS,
  RECEIVE_LOGIN_SUCCESS,
  RECEIVE_LOGIN_FAILURE,
  RECEIVE_FB_USER_DATA,
  RECEIVE_FB_USER_ID,
  RECEIVE_FRIEND_LIST,
  RECEIVE_USER_DATA,
  REQUEST_CHAT_LIST_SUCCESS,
  REQUEST_CHAT_LIST_FAILURE,
  REQUEST_CHAT_ROOM_SUCCESS,
  CREATE_CHAT_SUCCESS,
  CREATE_CHAT_FAILURE,
  RECEIVE_FRIEND_ONLINE,
  RECEIVE_FRIEND_OFFLINE,
  CREATE_CHAT_MESSAGE,
  RECEIVE_NEW_MESSAGE,
  UPDATE_CURRENT_CHATROOM,
  RECEIVE_APP_ERROR,
  FRIEND_EMOTION_CHANGE,
  REQUEST_DELETE_CHAT,
  UPDATE_LAST_MESSAGE,
  UPDATE_CURRENT_CHATLIST
} from '../actionTypes';

const login = (state = false, action) => {
  switch (action.type) {
    case REQUEST_LOGIN_STATUS:
    case RECEIVE_LOGIN_FAILURE:
      return false;
    case RECEIVE_FB_USER_DATA:
    case RECEIVE_FRIEND_LIST:
    case RECEIVE_LOGIN_SUCCESS:
    case RECEIVE_FB_USER_ID:
    default:
      return true;
  }
};

const user = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_FB_USER_DATA:
      return Object.assign({}, state, {
        name: action.name,
        email: action.email,
        profile_image_url: action.picture.data.url
      });
    case RECEIVE_FB_USER_ID:
      return Object.assign({}, state, {
        facebookID: action.facebookID
      });
    case RECEIVE_USER_DATA:
      return Object.assign({}, state, {
        uphere_id: action.user.uphere_id,
        name: action.user.name,
        email: action.user.email,
        profile_image_url: action.user.profile_image_url
      });
    default:
      return Object.assign({}, state);
  }
};

const friendList = (state = [], action) => {
  const newState = state.slice();
  let isExistingFriend = false;

  switch (action.type) {
    case RECEIVE_FRIEND_LIST:
      return action.friendList.map((friend) => {
        return Object.assign({}, state, {
          name: friend.name,
          email: friend.email_address,
          facebookID: friend.facebook_id,
          uphere_id: friend.uphere_id,
          profile_image_url: friend.profile_image_url,
          isOnOff: false,
          emotion_status: friend.emotion_status
        });
      });
    case RECEIVE_FRIEND_ONLINE:
      newState.forEach((friend) => {
        if(friend.uphere_id === action.friend.uphere_id) {
          isExistingFriend = true;
          friend.isOnOff = true;
        }
      });
      if(!isExistingFriend) {
        action.friend.isOnOff = true;
        newState.push(action.friend);
      }
      return newState;
    case RECEIVE_FRIEND_OFFLINE:
      newState.forEach((friend) => {
        if(friend.uphere_id === action.friend.uphere_id) {
          friend.isOnOff = false;
        }
      });
      return newState;
    case FRIEND_EMOTION_CHANGE:
      return state.map((friend) => {
        if (friend.uphere_id === action.friend_id) {
          friend.emotion_status = action.emotion_status;
        }

        return friend;
      });
    default:
      return state.slice();
  };
};

const chatList = (state = [], action) => {
  switch (action.type) {
    case REQUEST_CHAT_LIST_FAILURE:
      return state.slice();
    case REQUEST_CHAT_LIST_SUCCESS:
      return action.chats.map((chatroom) => {
        return Object.assign({}, state, {
          uphere_id: chatroom.uphere_id,
          participants: chatroom.participants,
          messages: chatroom.messages
        });
      });
    case CREATE_CHAT_SUCCESS:
      const newState = state.slice();

      const existingChat = newState.filter((chat) => {
        return chat.uphere_id === action.chatroom.uphere_id;
      })[0];

      if (existingChat) {
        return newState;
      }

      const newChat = {
        uphere_id: action.chatroom.uphere_id,
        participants: action.chatroom.participants,
        messages: action.chatroom.messages
      };

      newState.push(newChat);

      return newState;
    case CREATE_CHAT_FAILURE:
      return state.slice();
    case RECEIVE_NEW_MESSAGE:
      const newChats = state.slice();
      newChats.forEach((chat) => {
        if (chat.uphere_id === action.chat_id && chat.messages.length &&
          chat.messages[chat.messages.length - 1].uphere_id !== action.message.uphere_id) {
          chat.messages.push({
            sender_id: action.message.sender_id,
            text: action.message.text,
            uphere_id: action.message.uphere_id,
            created_at: action.message.created_at
          });
        }
      });
      return newChats;
    case UPDATE_CURRENT_CHATLIST:
      const updateChats = state.slice();
      const isChatExisted = updateChats.some((chat) => {
        if (action.chat) {
          return chat.uphere_id === action.chat.uphere_id;
        } return updateChats;
      });
      if (isChatExisted) {
        return updateChats;
      }
      updateChats.push(action.chat);
      return updateChats;
    case CREATE_CHAT_MESSAGE:
      const chats = state.slice();
      chats.forEach((chat) => {
        if (chat.uphere_id === action.chatroom.uphere_id
            && chat.messages.length && chat.messages[chat.messages.length - 1].uphere_id !== action.text_id) {
          chat.messages.push({
            sender_id: action.user_id,
            text: action.text,
            uphere_id: action.text_id,
            created_at: action.created_at
          });
        }
      });
      return chats;
    case REQUEST_DELETE_CHAT:
      const currentChats = state.slice();
      var updatedChats = [];
      currentChats.forEach((chat, i) => {
        if (chat.uphere_id === action.chat_id) {
          updatedChats = [
            ...currentChats.slice(0, i),
            ...currentChats.slice(i + 1)
          ];
        }
      });
      return updatedChats;
    case UPDATE_LAST_MESSAGE:
      const sortChat = state.slice();
      if (sortChat.length === 0 || sortChat.length === 1) {
        return sortChat;
      } else if (sortChat.every((chat) => {return chat.messages.length !== 0})) {
        return sortChat.sort((a, b) => {
          let keyA = new Date(a.messages[a.messages.length - 1].created_at);
          let keyB = new Date(b.messages[b.messages.length - 1].created_at);
          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });
      }
    default:
      return state.slice();
  }
};

const initialChatRoomState = {
  messages: [],
  uphere_id: null,
  participants: []
};

const currentChatRoom = (state = initialChatRoomState, action) => {
  switch (action.type) {
    case REQUEST_CHAT_ROOM_SUCCESS:
      return Object.assign({}, state, {
        uphere_id: action.chatroom.uphere_id,
        participants: action.chatroom.participants,
        messages: action.chatroom.messages
      });
    case RECEIVE_NEW_MESSAGE:
      if (state.uphere_id !== action.chat_id) {
        return Object.assign({}, state);
      }

      if (state.messages.length && state.messages[state.messages.length - 1].uphere_id === action.message.uphere_id) {
        return Object.assign({}, state);
      }

      var newMessage = {
        uphere_id: action.message.uphere_id,
        sender_id: action.message.sender_id,
        text: action.message.text,
        created_at: action.message.created_at
      };
      var updatedChat = Object.assign({}, state);
      updatedChat.messages.push(newMessage);
      return updatedChat;
    case CREATE_CHAT_MESSAGE:
      if (state.messages.length > 0 &&
          state.messages[state.messages.length - 1].uphere_id === action.text_id) {
        return Object.assign({}, state);
      }

      var msg = {
        uphere_id: action.text_id,
        sender_id: action.user_id,
        text: action.text,
        created_at: action.created_at
      };
      var newState = Object.assign({}, state);
      newState.messages.push(msg);
      return newState;
    case UPDATE_CURRENT_CHATROOM:
      return Object.assign({}, action.chatroom);
    case REQUEST_DELETE_CHAT:
      return Object.assign({}, state, initialChatRoomState);
    default:
      return Object.assign({}, state);
  };
};

const error = (state = null, action) => {
  switch (action.type) {
    case REQUEST_CHAT_LIST_FAILURE:
    case RECEIVE_APP_ERROR:
      return action.error;
    case RECEIVE_LOGIN_FAILURE:
    default:
      return null;
  }
};

export default combineReducers({
  isLoggedIn: login,
  user,
  friendList,
  chatList,
  currentChatRoom,
  error
});
