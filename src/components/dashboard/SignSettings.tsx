import { useCallback, useEffect, useRef, useState } from "react";
import { InputV2, Text } from "@arconnect/components";
import browser from "webextension-polyfill";
import styled from "styled-components";
import { ExtensionStorage } from "~utils/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { EventType, trackEvent } from "~utils/analytics";
import { ToggleSwitch } from "~routes/popup/subscriptions/subscriptionDetails";

export const SignSettingsDashboardView = () => {
  const valueChanged = useRef(false);
  const [editingValue, setEditingValue] = useState(null);

  const [signatureAllowance, setSignatureAllowance] = useStorage(
    {
      key: "signatureAllowance",
      instance: ExtensionStorage
    },
    (v) => (v === undefined ? 10 : Number(v))
  );

  const [signatureAllowanceEnabled, setSignatureAllowanceEnabled] = useStorage(
    {
      key: "signatureAllowanceEnabled",
      instance: ExtensionStorage
    },
    (v) => (v === undefined ? true : Boolean(v))
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    valueChanged.current = true;
    setEditingValue(e.target.value);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const newAllowance = Number(e.target.value);

      if (newAllowance !== signatureAllowance) {
        trackEvent(EventType.SEND_ALLOWANCE_CHANGE, {
          before: signatureAllowance,
          after: newAllowance
        });
        setSignatureAllowance(newAllowance);
      }
    },
    [signatureAllowance]
  );

  useEffect(() => {
    if (!valueChanged.current) {
      setEditingValue(signatureAllowance);
    }
  }, [signatureAllowance]);

  return (
    <Wrapper>
      <ToggleSwitchWrapper>
        <Text>{browser.i18n.getMessage("enable_transfer_settings")}</Text>
        <ToggleSwitch
          checked={signatureAllowanceEnabled}
          setChecked={setSignatureAllowanceEnabled}
        />
      </ToggleSwitchWrapper>
      <InputV2
        label={browser.i18n.getMessage("password_allowance")}
        type="number"
        value={editingValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={!signatureAllowanceEnabled}
        fullWidth
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const ToggleSwitchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;
