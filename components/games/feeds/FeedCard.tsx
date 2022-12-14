import { AnswerType } from '../../../constants/answer-type';
import { GameMission } from '../../../models/GameMission';
import { GameTeam } from '../../../models/GameTeam';
import { Submission } from '../../../models/Submission';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { TextAnswerData } from '../../../models/answer-data/TextAnswerData';
import { FileAnswerData } from '../../../models/answer-data/FileAnswerData';
import OnedriveImage from '../../shared/OnedriveImage';
import dynamic from 'next/dynamic';
import { LocationAnswerData } from '../../../models/answer-data/LocationAnswerData';
import { COLORS } from '../../../constants/color';
import { GameTeamUser } from '../../../models/GameTeamUser';
import { MultipleChoiceAnswerData } from '../../../models/answer-data/MultipleChoiceAnswerData';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { VerificationAnswerData } from '../../../models/answer-data/VerificationAnswerData';
import { TextUtils } from '../../../lib/text-utils';

type Props = {
  submission: Submission & { mission: GameMission } & { game_team: GameTeam };
  currentTeam: GameTeamUser;
};

export default function FeedCard({ submission, currentTeam }: Props) {
  const getTextAnswer = (answer: TextAnswerData) => {
    if (
      submission.game_team_id === currentTeam.game_team_id &&
      (answer.text.length != 6 || !TextUtils.validateContainsAlphaNumeric(answer.text))
    )
      return <b>{answer.text}</b>;
    return <span className='text-gray-400'>Hidden</span>;
  };

  const getVerificationAnswer = (answer: VerificationAnswerData) => {
    if (submission.game_team_id === currentTeam.game_team_id) return <b>{answer.code}</b>;
    return <span className='text-gray-400'>Hidden</span>;
  };

  const getMultipleChoiceAnswers = (answer: MultipleChoiceAnswerData, sub: Submission) => {
    if (submission.game_team_id !== currentTeam.game_team_id)
      return <span className='text-gray-400'>Hidden</span>;
    return (
      <ul>
        {answer.answers.map((ans) => (
          <li
            className={`font-bold flex items-center ${
              sub.is_accepted ? 'text-green-600' : 'text-red-600'
            }`}
            key={ans}>
            {sub.is_accepted ? (
              <CheckIcon className='w-5 h-5 mr-2' />
            ) : (
              <XMarkIcon className='w-5 h-5 mr-2' />
            )}{' '}
            {ans}
          </li>
        ))}
      </ul>
    );
  };

  const renderContent = () => {
    let answer = null;
    switch (submission.mission.answer_type) {
      case AnswerType.TEXT:
        answer = JSON.parse(submission.answer_data) as TextAnswerData;
        return <div key={submission.id}>Answered: {getTextAnswer(answer)}</div>;
      case AnswerType.IMAGE:
        answer = JSON.parse(submission.answer_data) as FileAnswerData;
        return <OnedriveImage submission={submission} key={submission.id} />;
      case AnswerType.VERIFICATION:
        answer = JSON.parse(submission.answer_data) as VerificationAnswerData;
        return getVerificationAnswer(answer);
      case AnswerType.GPS:
        const MapWithNoSSR = dynamic(() => import('../../shared/Map'), {
          ssr: false,
          loading: () => <div className='text-center'>Loading...</div>,
        });
        answer = JSON.parse(submission.answer_data) as LocationAnswerData;
        return (
          <div className='h-64'>
            <MapWithNoSSR
              radius={0}
              targetLatitude={0}
              targetLongitude={0}
              sourceLatitude={answer.latitude}
              sourceLongitude={answer.longitude}
              dragging={false}
            />
          </div>
        );
      case AnswerType.MULTIPLE_CHOICE:
        answer = JSON.parse(submission.answer_data) as MultipleChoiceAnswerData;
        return <ul>Answered: {getMultipleChoiceAnswers(answer, submission)}</ul>;
      default:
        return <div className='text-sm text-gray-400'>Answer cant be displayed.</div>;
    }
  };

  return (
    <div className='border bg-white rounded shadow p-4'>
      <div className='flex items-center'>
        <div
          className='h-12 w-14 rounded-full border'
          style={{ backgroundColor: submission.game_team.color || COLORS.TEAM_DEFAULT }}></div>

        <div className='ml-2 w-full'>
          <div className='flex justify-between whitespace-pre-wrap'>
            <div className='font-bold'>{submission.game_team.name}</div>
          </div>
          <div className='text-sm font-normal whitespace-pre-wrap'>
            <span className='font-semibold'>{submission.mission.name}</span> &#x2022;{' '}
            <span>{submission.mission.point_value} points</span>
          </div>
        </div>
      </div>

      <div className='mt-4'>{renderContent()}</div>

      {submission.caption && <div className='mt-2 text-gray-600'>{submission.caption}</div>}
      <div className='text-xs text-right mt-2'>
        {formatDistanceToNow(new Date(submission.created_at))} ago
      </div>
    </div>
  );
}
