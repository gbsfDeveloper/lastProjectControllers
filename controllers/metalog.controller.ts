import { NextFunction, Request, Response } from 'express';

import { config } from '../config';
import LogService, { MetalogSections } from '../services/logs.service';

export const metalog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    const { elementId } = req.body as {
      elementId: string;
    };

    let { section } = req.body as {
      section: string;
    };

    if (typeof section !== 'string' || section === '') {
      return res
        .status(400)
        .json({ error: 'section must be a string and cannot be empty' });
    }

    let message: string;
    switch (section) {
      case 'CLOSE_ASSET':
        message = `El estudiante salio del asset con el assetId: ${elementId}`;
        section = MetalogSections.CLOSE_ASSET;
        break;
      case 'CLOSE_STEPBYSTEP':
        message = `El estudiante salio del stepbystep con el stepbystepId: ${elementId}`;
        section = MetalogSections.CLOSE_STEPBYSTEP;
        break;
      case 'CLOSE_LESSON':
        message = `El estudiante salio de la leccion con el lessonId: ${elementId}`;
        section = MetalogSections.CLOSE_LESSON;
        break;
      case 'SKIP_ASSESSMENT':
        message = `El estudiante omitio el assesment`;
        section = MetalogSections.SKIP_ASSESSMENT;
        break;
      case 'SKIP_ASSET_FEEDBACK':
        message = `El estudiante omitio el asset feedback`;
        section = MetalogSections.SKIP_ASSET_FEEDBACK;
        break;
      case 'INIT_WEEKLY_GAME':
        message = `El estudiante inicio el juego de la semana con el assetId: ${elementId}`;
        section = MetalogSections.INIT_WEEKLY_GAME;
        break;
      case 'INIT_WEEKLY_ASSESSMENT':
        message = `El estudiante inicio el assesment de la semana`;
        section = MetalogSections.INIT_WEEKLY_ASSESSMENT;
        break;
      case 'INIT_LESSON_ASSET':
        message = `El estudiante inicio un asset con el assetID: ${elementId}`;
        section = MetalogSections.INIT_LESSON_ASSET;
        break;
      case 'OPEN_SEARCH':
        message = `El estudiante entro en la seccion -search-`;
        section = MetalogSections.OPEN_SEARCH;
        break;
      case 'CLOSE_SEARCH':
        message = `El estudiante salio del search`;
        section = MetalogSections.CLOSE_SEARCH;
        break;
      // DATA EVENTS
      case 'CLICK_HOME_BLOCK_LESSON':
        message = `${elementId}`;
        section = MetalogSections.CLICK_HOME_BLOCK_LESSON;
        break;
      case 'CLICK_HOME_UNLOCK_BUTTON':
        message = `El estudiante dio click al boton Desbloquea aqui en lecciones`;
        section = MetalogSections.CLICK_HOME_UNLOCK_BUTTON;
        break;
      case 'CLICK_TOPICS_UNLOCK_BUTTON':
        message = `El estudiante dio click al boton Desbloquea aqui en explora temas`;
        section = MetalogSections.CLICK_TOPICS_UNLOCK_BUTTON;
        break;
      case 'CLICK_UNLOCK_BUTTON_PARENT_DASHBOARD':
        message = `El padre dio click al boton Desbloquea aqui en tablero de padres`;
        section = MetalogSections.CLICK_UNLOCK_BUTTON_PARENT_DASHBOARD;
        break;
      case 'PAYWALL_SUBSCRIPTION_WEEKLY':
        message = `WEEKLY`;
        section = MetalogSections.PAYWALL_SUBSCRIPTION_WEEKLY;
        break;
      case 'PAYWALL_SUBSCRIPTION_MONTHLY':
        message = `MONTHLY`;
        section = MetalogSections.PAYWALL_SUBSCRIPTION_MONTHLY;
        break;
      case 'PAYWALL_SUBSCRIPTION_QUARTERLY':
        message = `QUARTERLY`;
        section = MetalogSections.PAYWALL_SUBSCRIPTION_QUARTERLY;
        break;
      case 'PAYWALL_SUBSCRIPTION_SEMIANNUAL':
        message = `SEMIANNUAL`;
        section = MetalogSections.PAYWALL_SUBSCRIPTION_SEMIANNUAL;
        break;
      case 'COMPLETE_PARENTAL_GATE':
        message = `El usuario completo el control parental`;
        section = MetalogSections.COMPLETE_PARENTAL_GATE;
        break;
      case 'CLOSE_BUTTON_CONGRATS':
        message = `El usuario dio click al botón cerrar en página de felicitaciones por su compra`;
        section = MetalogSections.CLOSE_BUTTON_CONGRATS;
        break;
      case 'CONTINUE_BUTTON_CONGRATS':
        message = `El usuario dio click al botón continuar en página de felicitaciones por su compra`;
        section = MetalogSections.CONTINUE_BUTTON_CONGRATS;
        break;
      case 'PAYWALL_SUBSCRIPTION_BACK_BUTTON':
        message = `El usuario dio click al botón volver`;
        section = MetalogSections.PAYWALL_SUBSCRIPTION_BACK_BUTTON;
        break;
      case 'PARENTAL_GATE_BACK_BUTTON':
        message = `El usuario dio click al botón volver`;
        section = MetalogSections.PARENTAL_GATE_BACK_BUTTON;
        break;
      case 'PARENT_PROFILE_SUBSCRIPTION_BUTTON':
        message = `El usuario dio click al boton suscripciones en el perfil de padre`;
        section = MetalogSections.PARENT_PROFILE_SUBSCRIPTION_BUTTON;
        break;
      case 'PAYWALL_PAYMENT':
        message = `${elementId}`; // FRECUENCIA
        section = MetalogSections.PAYWALL_PAYMENT;
        break;
      case 'STEP_BY_STEP_FEEDBACK_SHOWED':
        message = `${elementId}`; // SE MOSTRO EL
        section = MetalogSections.STEP_BY_STEP_FEEDBACK_SHOWED;
        break;
      case 'STEP_BY_STEP_FEEDBACK_CLICKED':
        message = `${elementId}`; // SE MOSTRO EL
        section = MetalogSections.STEP_BY_STEP_FEEDBACK_CLICKED;
        break;
      default:
        message = ``;
        section = MetalogSections.NOT_VALID_EVENT;
        break;
    }

    if (section == MetalogSections.NOT_VALID_EVENT) {
      return res.status(400).json({ error: MetalogSections.NOT_VALID_EVENT });
    }

    if (section == MetalogSections.INIT_WEEKLY_ASSESSMENT) {
      return res.status(204).json(config.STATUS_OK);
    }

    await LogService.insertOneMetaLog(userType, userId, section, message);

    res.status(204).json(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
};
