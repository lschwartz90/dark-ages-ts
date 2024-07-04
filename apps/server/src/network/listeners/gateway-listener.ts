import { ClientPackets, ServerTable, ServerPackets, Redirect } from '@medenia/network';

import { Client } from '../client';
import { PacketHandler } from '../packet-handler';
import { Listener } from './listener';

export class GatewayListener extends Listener {
  protected serverTable: ServerTable;

  constructor() {
    super(2610, Client);

    this.serverTable = new ServerTable();
    this.serverTable.addEntry('127.0.0.1', 2611, 'A new name', 'Goes Here');
  }

  addClient(client: Client) {
    super.addClient(client);

    client.sendPacket(new ServerPackets.AcceptConnectionPacket('CONNECTED SERVER\n'));
  }

  @PacketHandler(ClientPackets.VersionPacket)
  protected onVersionPacket(client: Client) {
    client.sendPacket(new ServerPackets.ConnectionInfoPacket(false, 12, client.seed, client.key));
  }

  @PacketHandler(ClientPackets.ServerTableRequestPacket)
  protected onServerTableRequest(client: Client, packet: ClientPackets.ServerTableRequestPacket) {
    if (packet.mismatch) {
      client.sendPacket(new ServerPackets.ServerTablePacket(this.serverTable));
    } else {
      const entry = this.serverTable.getEntry(packet.id);

      this.redirect(client, entry.ip, entry.port);
    }
  }
}
