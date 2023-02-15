// actions
import {
  CLICK_UPDATE,
  OPEN_AULA,
} from '../actions/actionsTypes'

const initialState = {
    id: '111',
    idCourse: '111',
    tipo: 'MODELO',
    idAula: '123',
  };
  export const clickReducer = (state = initialState, action) => {
    switch (action.type) {
      case CLICK_UPDATE:
        return {
          ...state,
          id: action.payload.id,
          tipo: action.payload.tipo,
          idCourse: action.payload.idCourse,
        };

      case OPEN_AULA:
        return {
          ...state,
          idCurso: action.payload.idCurso,
          idAula: action.payload.idAula,
          tipoAula: action.payload.tipoAula,
      };
      default:
        return state;
    }
  };