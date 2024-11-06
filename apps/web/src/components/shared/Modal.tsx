import { Device } from "@/lib/constants";
import { ModalProps } from "@/types";
import { Modal as MantineModal } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

interface IProps extends ModalProps {
  children: React.ReactNode;
}

export function Modal(props: IProps) {
  const { width } = useViewportSize();
  const { opened, onClose, children } = props;

  const isMobile = width < Device.TABLET;

  return (
    <MantineModal.Root
      opened={opened}
      onClose={onClose}
      styles={{
        inner: { padding: isMobile ? 0 : 16 },
        content: { backgroundColor: "transparent" },
      }}
      size="auto"
      centered={!isMobile}
      fullScreen={isMobile}
    >
      <MantineModal.Overlay />

      <MantineModal.Content>{children}</MantineModal.Content>
    </MantineModal.Root>
  );
}
