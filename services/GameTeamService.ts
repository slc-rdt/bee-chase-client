import axios, { AxiosResponse } from 'axios';
import { CreateGameTeamDto } from '../models/dto/game-teams/create-team.dto';
import { GameTeam } from '../models/GameTeam';
import { BaseService } from './BaseService';

export class GameTeamService extends BaseService {
  public async create(gameId: string, dto: CreateGameTeamDto) {
    const response: AxiosResponse<GameTeam> = await axios.post(
      `${this.API_URL}/games/${gameId}/game_teams`,
      dto,
      this.headerWithToken(),
    );
    return response.data;
  }

  public async join(gameId: string, teamId: string, accessCode: string | null) {
    const response: AxiosResponse<any> = await axios.post(
      `${this.API_URL}/games/${gameId}/game_teams/${teamId}/join`,
      { access_code: accessCode },
      this.headerWithToken(),
    );
    return response.data;
  }

  public async getByGameId(gameId: string) {
    const response: AxiosResponse<GameTeam[]> = await axios.get(
      `${this.API_URL}/games/${gameId}/game_teams`,
      this.headerWithToken(),
    );
    return response.data;
  }

  public async verifyCode(gameId: string, teamId: string, accessCode: string) {
    const response: AxiosResponse<boolean> = await axios.post(
      `${this.API_URL}/games/${gameId}/game_teams/${teamId}/verify`,
      { access_code: accessCode },
      this.headerWithToken(),
    );
    return response.data;
  }

  public async checkUserAlreadyInTeam(gameId: string) {
    const response: AxiosResponse<boolean> = await axios.get(
      `${this.API_URL}/games/${gameId}/checkTeam`,
      this.headerWithToken(),
    );
    return response.data;
  }
}
