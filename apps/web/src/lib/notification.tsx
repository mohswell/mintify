import {
  IconCancel,
  IconExclamationMark,
  IconInfoSmall,
} from "@tabler/icons-react";
import { CheckIcon } from "@mantine/core";
import { NotificationData, notifications } from "@mantine/notifications";

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

const notification = ({
  title,
  message,
  type = "success",
  ...rest
}: NotificationProps) => {
  const Icon = notificationTypes[type].icon;

  notifications.clean();
  notifications.cleanQueue();

  notifications.show({
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
    ...rest,
  });
};

export default notification;
