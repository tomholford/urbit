import { Notifications, Notification, NotifIndex, NotificationGraphConfig, GroupNotificationsConfig } from "~/types";
import { makePatDa } from "~/logic/lib/util";
import _ from "lodash";

type HarkState = {
  notifications: Notifications;
  archivedNotifications: Notifications;
  notificationsCount: number;
  notificationsGraphConfig: NotificationGraphConfig;
  groupNotifications: GroupNotificationsConfig;
};

export const HarkReducer = (json: any, state: HarkState) => {
  const data = _.get(json, "harkUpdate", false);
  if (data) {
    reduce(data, state);
  }
  const graphHookData = _.get(json, "hark-graph-hook-update", false);
  if (graphHookData) {
    console.log(graphHookData);
    graphInitial(graphHookData, state);
    graphWatchSelf(graphHookData, state);
    graphMentions(graphHookData, state);
  }
  const groupHookData = _.get(json, "hark-group-hook-update", false);
  if(groupHookData) {
    groupInitial(groupHookData, state);
    groupListen(groupHookData, state);
    groupIgnore(groupHookData, state);
  }
};

function groupInitial(json: any, state: HarkState) {
  const data = _.get(json, 'initial', false);
  if(data) {
    state.groupNotifications = data;
  }
}

function graphInitial(json: any, state: HarkState) {
  const data = _.get(json, "initial", false);
  if (data) {
    state.notificationsGraphConfig = data;
  }
}

function groupListen(json: any, state: HarkState) {
  const data = _.get(json, "listen", false);
  if (data) {
    state.groupNotifications = [...state.groupNotifications, data];
  }
}

function groupIgnore(json: any, state: HarkState) {
  const data = _.get(json, "ignore", false);
  if (data) {
    state.groupNotifications = state.groupNotifications.filter(n => n!== data);
  }
}

function graphMentions(json: any, state: HarkState) {
  const data = _.get(json, "set-mentions", undefined);
  if (!_.isUndefined(data)) {
    state.notificationsGraphConfig.mentions = data;
  }
}

function graphWatchSelf(json: any, state: HarkState) {
  const data = _.get(json, "set-watch-on-self", undefined);
  if (!_.isUndefined(data)) {
    state.notificationsGraphConfig.watchOnSelf = data;
  }
}

function reduce(data: any, state: HarkState) {
  unread(data, state);
  read(data, state);
  archive(data, state);
  timebox(data, state);
  more(data, state);
  dnd(data, state);
  count(data, state);
}

function count(json: any, state: HarkState) {
  const data = _.get(json, "count", false);
  if (data !== false) {
    state.notificationsCount = data;
  }
}

const dnd = (json: any, state: HarkState) => {
  const data = _.get(json, "set-dnd", undefined);
  if (!_.isUndefined(data)) {
    state.doNotDisturb = data;
  }
};

const timebox = (json: any, state: HarkState) => {
  const data = _.get(json, "timebox", false);
  if (data) {
    const time = makePatDa(data.time);
    if (data.archive) {
      state.archivedNotifications.set(time, data.notifications);
    } else {
      state.notifications.set(time, data.notifications);
    }
  }
};

function more(json: any, state: HarkState) {
  const data = _.get(json, "more", false);
  if (data) {
    _.forEach(data, (d) => reduce(d, state));
  }
}

function notifIdxEqual(a: NotifIndex, b: NotifIndex) {
  if ("graph" in a && "graph" in b) {
    return (
      a.graph.graph === b.graph.graph &&
      a.graph.group === b.graph.group &&
      a.graph.module === b.graph.module &&
      a.graph.description === b.graph.description
    );
  } else if ("group" in a && "group" in b) {
    return (
      a.group.group === b.group.group &&
      a.group.description === b.group.description
    );
  }
  return false;
}

function setRead(
  time: string,
  index: NotifIndex,
  read: boolean,
  state: HarkState
) {
  const patDa = makePatDa(time);
  const timebox = state.notifications.get(patDa);
  if (_.isNull(timebox)) {
    console.warn("Modifying nonexistent timebox");
    return;
  }
  const arrIdx = timebox.findIndex((idxNotif) =>
    notifIdxEqual(index, idxNotif.index)
  );
  if (arrIdx === -1) {
    console.warn("Modifying nonexistent index");
    return;
  }
  timebox[arrIdx].notification.read = read;
  state.notifications.set(patDa, timebox);
}

function read(json: any, state: HarkState) {
  const data = _.get(json, "read", false);
  if (data) {
    const { time, index } = data;
    state.notificationsCount--;
    setRead(time, index, true, state);
  }
}

function unread(json: any, state: HarkState) {
  const data = _.get(json, "unread", false);
  if (data) {
    const { time, index } = data;
    state.notificationsCount++;
    setRead(time, index, false, state);
  }
}

function archive(json: any, state: HarkState) {
  const data = _.get(json, "archive", false);
  if (data) {
    const { index } = data;
    const time = makePatDa(data.time);
    const timebox = state.notifications.get(time);
    if (!timebox) {
      console.warn("Modifying nonexistent timebox");
      return;
    }
    const [archived, unarchived] = _.partition(timebox, (idxNotif) =>
      notifIdxEqual(index, idxNotif.index)
    );
    state.notifications.set(time, unarchived);
    const archiveBox = state.archivedNotifications.get(time) || [];
    state.notificationsCount -= archived.filter(
      ({ notification }) => !notification.read
    ).length;
    state.archivedNotifications.set(time, [
      ...archiveBox,
      ...archived.map(({ notification, index }) => ({
        notification: { ...notification, read: true },
        index,
      })),
    ]);
  }
}