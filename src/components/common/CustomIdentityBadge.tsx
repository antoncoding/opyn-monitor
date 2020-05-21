import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Modal, TextInput, Button, IdentityBadge, Header, textStyle, useTheme, IconLabel } from '@aragon/ui'
import { getPreference, storePreference } from '../../utils/storage'

type CustomIdentityBadgeProps = {
  shorten?: boolean
  connectedAccount?: boolean
  entity?: string
  label?: string
}

function CustomIdentityBadge({ entity, connectedAccount, label, shorten }: CustomIdentityBadgeProps) {
  const theme = useTheme()

  const [storedLabels, setAllLabels] = useState<{address: string, label: string}[]>(JSON.parse(getPreference('labels', '[]')))
  const [open, setOpened] = useState(false)

  const [displayLabel, setDisplayLabel] = useState(label)

  const [newLabel, setNewLabel] = useState<string | undefined>(displayLabel)

  useEffect(() => {
    const customLabelOrUndefined = storedLabels.find(entry => entry.address === entity)?.label
    setDisplayLabel(customLabelOrUndefined)
    setNewLabel(customLabelOrUndefined)
    return () => {
      
    }
  }, [storedLabels, entity])

  const onClickSave = () => {
    if (!entity || !newLabel) return;
    const entry = { address: entity, label: newLabel }
    const newInfos = storedLabels.filter(labels => labels.address !== entity).concat(entry)
    setAllLabels(newInfos)
    storePreference('labels', JSON.stringify(newInfos))
    setOpened(false)
  }

  const onClickRemove = () => {
    const newInfos = storedLabels.filter(labels => labels.address !== entity)
    setAllLabels(newInfos)
    storePreference('labels', JSON.stringify(newInfos))
    setOpened(false)
  }
  
  return (
    <>
      <IdentityBadge
        entity={entity}
        connectedAccount={connectedAccount}
        label={displayLabel}
        shorten={shorten}
        popoverAction={{
          label: <><IconLabel></IconLabel> Add custom label </>,
          onClick: () => { setOpened(true) }
        }}
      />
      <Modal visible={open} onClose={() => { setOpened(false) }}>
        <Header primary={'Add Custom Label'} />
        This label would be displayed instead of the following address and only be stored on this device.
        <br />
        <IdentityBadge entity={entity} />
        <br />
        <br />
        <Label theme={theme}> Custom Label </Label>
        <TextInput value={newLabel} onChange={(e) => { setNewLabel(e.target.value) }} wide />
        <div style={{ display: 'flex', paddingTop: '10px' }}>
          <div style={{ marginLeft: 'auto' }}>
            <Button label="Remove" onClick={onClickRemove}/><Button label="Save" onClick={onClickSave} mode="strong" />
          </div>
        </div>

      </Modal>
    </>
  )
}

export default CustomIdentityBadge

const Label = styled.div`
  ${textStyle('label1')}
  color: ${(props) => props.theme.contentSecondary};
  padding-bottom: 10px
`