import { startSession, Types } from 'mongoose';
import isEmpty from 'validator/lib/isEmpty';

import { config } from '../../config';
import { SignupProps } from '../../controllers/parent.signup.controller';
import { generateAccessToken } from '../../lib/helpers/generateAccessToken';
import { UTCDate } from '../../lib/helpers/generateDates';
import { UserTypes } from '../../middlewares/authentication';
import {
  Parent,
  ParentModel,
  StudentModel,
  SubscriptionStatus,
} from '../../models';
import HubspotService from '../hubspot.service';
import ParentService from '../parent.service';
import StudentService from '../student.service';

export const signUpWithUserAndPassword = async ({
  email,
  password,
  isTermsAndConditionsAccepted,
  phoneNumber,
  username = '',
  numberOfKids = 0,
  userNames = '',
  userLastNames = '',
}: SignupProps) => {
  const newParent = new ParentModel({
    email,
    password,
    isTermsAndConditionsAccepted,
  });

  if (phoneNumber && !isEmpty(phoneNumber)) {
    newParent.phoneNumber = phoneNumber;
  }
  if (numberOfKids) {
    newParent.numberOfKids = numberOfKids;
  }
  if (userNames) {
    newParent.userNames = userNames;
  }
  if (userLastNames) {
    newParent.userLastNames = userLastNames;
  }
  if (username) {
    newParent.username = username;
  }

  newParent.subscription = {
    status: SubscriptionStatus.FREEMIUM,
    dueDate: config.FREEMIUM_DUE_DATE,
    isTrialAvailable: false,
  };

  await newParent.save();

  return newParent;
};

export const signUpStudent = async ({
  avatar,
  username,
}: Record<string, string>) => {
  const usernameInDB = await StudentService.findStudentInfoWithUsername(
    username
  );

  if (usernameInDB) {
    return false;
  }

  const newStudent = await StudentModel.create({
    username,
    avatar,
    createdAt: UTCDate(),
  });

  return newStudent._id;
};

export const registerStudentService = async (
  { avatar, username }: Record<string, string>,
  parentId: Types.ObjectId
) => {
  const usernameInDB = await StudentService.findStudentInfoWithUsername(
    username
  );

  if (usernameInDB) {
    return false;
  }

  const session = await startSession();
  session.startTransaction();

  try {
    const newStudent = await StudentModel.create({
      username,
      avatar,
      parentId,
      createdAt: UTCDate(),
    });

    await ParentModel.updateOne(
      { _id: parentId },
      { $push: { students: newStudent._id } }
    );

    await session.commitTransaction();

    const parentInfoEmail = await ParentService.findParentEmailWithId(parentId);
    // HUBSPOT
    if (config.NODE_ENV !== 'development') {
      HubspotService.registerStudent({
        parentEmail: parentInfoEmail ? parentInfoEmail.email : '',
        username: username,
        parent_id: parentId.toString(),
        student_id: newStudent._id.toString(),
      });

      HubspotService.onboardingParentComplete({
        parentEmail: parentInfoEmail ? parentInfoEmail.email : '',
        username: username,
        parent_id: parentId.toString(),
        student_id: newStudent._id.toString(),
      });
    }

    return generateAccessToken({
      id: newStudent._id,
      userType: UserTypes.STUDENT,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

type SignUpThirdParty = (arg0: {
  email: string;
  firebaseUid: string;
  isTermsAndConditionsAccepted: boolean;
}) => Promise<Parent>;

export const signUpThirdParty: SignUpThirdParty = async (parentProps) => {
  const newParent = new ParentModel({
    ...parentProps,
  });

  newParent.subscription = {
    status: SubscriptionStatus.FREEMIUM,
    dueDate: config.FREEMIUM_DUE_DATE,
    isTrialAvailable: false,
  };

  await newParent.save();

  return newParent;
};
