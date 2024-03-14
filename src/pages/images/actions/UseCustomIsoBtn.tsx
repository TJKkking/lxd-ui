import { FC } from "react";
import { Button } from "@canonical/react-components";
import usePortal from "react-useportal";
import { LxdImageType, RemoteImage } from "types/image";
import CustomIsoModal from "pages/images/CustomIsoModal";
import { useTranslation } from "react-i18next";

interface Props {
  onSelect: (image: RemoteImage, type: LxdImageType | null) => void;
}

const UseCustomIsoBtn: FC<Props> = ({ onSelect }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleSelect = (image: RemoteImage, type: LxdImageType | null) => {
    closePortal();
    onSelect(image, type);
  };

  const { t } = useTranslation();

  return (
    <>
      <Button
        appearance="link"
        onClick={openPortal}
        type="button"
        id="select-custom-iso"
      >
        <span>{t("use-custom-iso")}</span>
      </Button>
      {isOpen && (
        <Portal>
          <CustomIsoModal onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};

export default UseCustomIsoBtn;
