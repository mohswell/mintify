import { GithubService } from "../github/github.service";

export const githubProviders = [
  {
    provide: GithubService,  // dependency injection class
    useClass: GithubService,
  },
];