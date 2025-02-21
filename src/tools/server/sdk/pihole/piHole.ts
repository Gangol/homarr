import { trimStringEnding } from '~/tools/shared/strings';

import { PiHoleApiStatusChangeResponse, PiHoleApiSummaryResponse } from './piHole.type';

export class PiHoleClient {
  private readonly baseHostName: string;

  constructor(
    hostname: string,
    private readonly apiToken: string
  ) {
    this.baseHostName = trimStringEnding(hostname, ['/admin/index.php', '/admin', '/']);
  }

    async getSummary() {
      const authResponse = await fetch(`${this.baseHostName}/api/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: this.apiToken }) 
      });

      if (!authResponse.ok) {
          throw new Error(`Authentication failed: ${authResponse.status}`);
      }

      const authJson = await authResponse.json();
      if (!authJson.session?.valid || !authJson.session.sid) {
          throw new Error(`Invalid session response: ${JSON.stringify(authJson)}`);
      }

      const sessionId = authJson.session.sid;

      const response = await fetch(
          new URL(`${this.baseHostName}/api.php?summaryRaw&auth=${sessionId}`)
      );

      if (response.status !== 200) {
          throw new Error(`Failed to fetch summary: ${response.status}`);
      }

      const json = await response.json();

      if (Array.isArray(json)) {
          throw new Error(
              `Response does not indicate success. Authentication might be invalid: ${json}`
          );
      }
      return json as PiHoleApiSummaryResponse;
  }


  async enable() {
    const response = await this.sendStatusChangeRequest('enable');
    return response.status === 'enabled';
  }

  async disable(duration: number) {
    const response = await this.sendStatusChangeRequest('disable', duration);
    return response.status === 'disabled';
  }

  private async sendStatusChangeRequest(
    action: 'enable' | 'disable',
    duration = 0
  ): Promise<PiHoleApiStatusChangeResponse> {
    const response = await fetch(
      duration !== 0
        ? `${this.baseHostName}/api?${action}=${duration}&auth=${this.apiToken}`
        : `${this.baseHostName}/api?${action}&auth=${this.apiToken}`
    );

    if (response.status !== 200) {
      return Promise.reject(new Error(`Status code does not indicate success: ${response.status}`));
    }

    const json = await response.json();

    if (Array.isArray(json)) {
      return Promise.reject(
        new Error(
          `Response does not indicate success. Authentication is most likely invalid: ${json}`
        )
      );
    }

    for (let loops = 0; loops < 10; loops++) {
      const summary = await this.getSummary();
      if (summary.status === action + 'd') {
        return { status: summary.status } as PiHoleApiStatusChangeResponse;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }

    return Promise.reject(
      new Error(`Although PiHole received the command, it failed to update it's status: ${json}`)
    );
  }
}
