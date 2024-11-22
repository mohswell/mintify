"use client";

import { NotificationData, showNotification } from "@mantine/notifications";
import {
  IconCancel,
  IconExclamationMark,
  IconInfoSmall,
} from "@tabler/icons-react";
import { CheckIcon } from "@mantine/core";

interface NotificationProps extends NotificationData {
  type?: "info" | "success" | "error" | "warning";
}

const notificationTypes = {
  info: {
    color: "#535353",
    icon: IconInfoSmall,
  },
  error: {
    color: "#E23030",
    icon: IconCancel,
  },
  warning: {
    color: "orange",
    icon: IconExclamationMark,
  },
  success: {
    color: "#038336",
    icon: CheckIcon,
  },
};

const NotificationWrapper = ({
  title,
  message,
  type = "success",
}: NotificationProps & { [key: string]: any }) => {
  const Icon = notificationTypes[type].icon;

  showNotification({
    radius: 8,
    title: title,
    message: message,
    color: notificationTypes[type].color,
    icon: (
      <Icon
        className={`h-auto shrink-0
        ${
          type === "info"
            ? "w-9"
            : type === "warning"
              ? "w-6 stroke-2"
              : "w-4 stroke-[1.5]"
        }`}
      />
    ),
    //...rest,
  });

  return null;
};

export default NotificationWrapper;
