import { FC, useState } from "react";
import {
  Button,
  Col,
  Notification,
  Row,
  Tabs,
} from "@canonical/react-components";
import { useTranslation } from "react-i18next";

const FIREFOX = "Firefox";
const CHROME_LINUX = "Chrome (Linux)";
const CHROME_WINDOWS = "Chrome (Windows)";
const EDGE = "Edge";
const MACOS = "macOS";
const TABS: string[] = [FIREFOX, CHROME_LINUX, CHROME_WINDOWS, EDGE, MACOS];

interface Props {
  sendPfx?: () => void;
}

const BrowserImport: FC<Props> = ({ sendPfx }) => {
  const [activeTab, handleTabChange] = useState(FIREFOX);

  const { t } = useTranslation();

  const windowsDialogSteps = (
    <>
      <li className="p-list__item">
        {t("this-opens-a-certificate-management-dialog-click")}{" "}
        <code>Import...</code>
        then <code>{t("next")}</code> {t("and-select-the")}{" "}
        <code>lxd-ui.pfx</code>{" "}
        {t(
          "file-you-just-downloaded-enter-your-password-or-leave-the-field-empty-if-you-have-not-set-one-click",
        )}{" "}
        <code>{t("next")}</code>.
      </li>
      <li className="p-list__item">
        {t("select")}{" "}
        <code>{t("automatically-select-the-certificate-store")}</code>{" "}
        {t("and-click")} <code>{t("next")}</code>
        {t("then-click")} <code>{t("finish")}</code>.
      </li>
      <li className="p-list__item">
        {t("restart-the-browser-and-open-lxd-ui-select-the-lxd-ui-certificate")}
      </li>
    </>
  );

  const downloadPfx = (
    <li className="p-list__item u-clearfix">
      {t("download")} <code>lxd-ui.pfx</code>
      {sendPfx && (
        <div className="u-float-right--large">
          <Button onClick={sendPfx}>{t("download-pfx")}</Button>
        </div>
      )}
    </li>
  );

  return (
    <Row>
      <Col size={8}>
        <Tabs
          links={TABS.map((tab) => ({
            label: tab,
            active: tab === activeTab,
            onClick: () => handleTabChange(tab),
          }))}
        />

        {activeTab === FIREFOX && (
          <div role="tabpanel" aria-label="firefox">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                {t("paste-this-link-into-the-address-bar")}
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>about:preferences#privacy</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                {t("scroll-down-to-the-certificates-section-and-click-the")}{" "}
                <code>{t("view-certificates")}</code> button.
              </li>
              <li className="p-list__item">
                {t("in-the-popup-click")} <code>{t("your-certificates")}</code>{" "}
                {t("and-then")} <code>{t("import")}</code>.
              </li>
              <li className="p-list__item">
                {t("select-the")} <code>lxd-ui.pfx</code>{" "}
                {t(
                  "file-you-just-downloaded-enter-your-password-or-leave-the-field-empty-if-you-have-not-set-one",
                )}
              </li>
              <li className="p-list__item">
                {t(
                  "restart-the-browser-and-open-lxd-ui-select-the-lxd-ui-certificate",
                )}
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_LINUX && (
          <div role="tabpanel" aria-label="chrome linux">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                {t("paste-into-the-address-bar")}
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/certificates</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                {t("click-the")} <code>{t("import")}</code>{" "}
                {t("button-and-select-the")} <code>lxd-ui.pfx</code>{" "}
                {t(
                  "file-you-just-downloaded-enter-your-password-or-leave-the-field-empty-if-you-have-not-set-one",
                )}
              </li>
              <li className="p-list__item">
                {t(
                  "restart-the-browser-and-open-lxd-ui-select-the-lxd-ui-certificate-0",
                )}
              </li>
            </ul>
          </div>
        )}

        {activeTab === CHROME_WINDOWS && (
          <div role="tabpanel" aria-label="chrome windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                {t("paste-into-the-address-bar")}
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>chrome://settings/security</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                {t("scroll-down-to-the")} <code>{t("advanced-settings")}</code>{" "}
                {t("and-click")} <code>{t("manage-device-certificates")}</code>
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === EDGE && (
          <div role="tabpanel" aria-label="edge windows">
            <ul className="p-list--divided u-no-margin--bottom">
              {downloadPfx}
              <li className="p-list__item">
                {t("paste-into-the-address-bar")}
                <div className="p-code-snippet u-no-margin--bottom">
                  <pre className="p-code-snippet__block">
                    <code>edge://settings/privacy</code>
                  </pre>
                </div>
              </li>
              <li className="p-list__item">
                {t("scroll-to-the")} <code>{t("security")}</code>{" "}
                {t("section-and-click")} <code>{t("manage-certificates")}</code>
              </li>
              {windowsDialogSteps}
            </ul>
          </div>
        )}

        {activeTab === MACOS && (
          <div role="tabpanel" aria-label="safari macos">
            <ul className="p-list--divided u-no-margin--bottom">
              <li className="p-list__item">
                <Notification
                  severity="caution"
                  className="u-no-margin--bottom"
                >
                  {t(
                    "the-certificate-must-be-protected-by-password-an-empty-password-will-fail-to-be-imported-on-macos",
                  )}
                </Notification>
              </li>
              {downloadPfx}
              <li className="p-list__item">
                {t(
                  "start-the-keychain-access-app-on-your-mac-select-the-login-keychain",
                )}
              </li>
              <li className="p-list__item">
                {t("drag-the")} <code>lxd-ui.pfx</code>{" "}
                {t("file-onto-the-keychain-access-app")}
              </li>
              <li className="p-list__item">
                {t(
                  "if-you-are-asked-to-provide-a-name-and-password-type-the-name-and-password-for-an-administrator-user-on-this-computer",
                )}
              </li>
              <li className="p-list__item">
                {t(
                  "restart-the-browser-and-open-lxd-ui-select-the-lxd-ui-certificate",
                )}
              </li>
            </ul>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default BrowserImport;
