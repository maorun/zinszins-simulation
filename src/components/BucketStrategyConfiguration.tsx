import React, { useState } from 'react';
import {
    Form,
    InputNumber,
    Input,
    Button,
    Radio,
    RadioGroup,
    Toggle,
    Table,
    ButtonGroup,
    Modal,
    Slider,
    Message
} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import type { BucketConfig } from '../../helpers/withdrawal';
import type { ReturnConfiguration } from '../../helpers/random-returns';

const { Column, HeaderCell, Cell } = Table;

type BucketStrategyConfigurationProps = {
    bucketConfigs: BucketConfig[];
    onBucketConfigsChange: (configs: BucketConfig[]) => void;
    formValue: {
        bucketBasisrate: number;
        bucketRebalancing: boolean;
    };
};

export function BucketStrategyConfiguration({
    bucketConfigs,
    onBucketConfigsChange,
    formValue: _formValue
}: BucketStrategyConfigurationProps) {
    const [showBucketModal, setShowBucketModal] = useState(false);
    const [editingBucket, setEditingBucket] = useState<BucketConfig | null>(null);
    const [editingBucketIndex, setEditingBucketIndex] = useState<number>(-1);

    // Calculate total allocation
    const totalAllocation = bucketConfigs.reduce((sum, bucket) => sum + bucket.allocation, 0);
    const isValidAllocation = Math.abs(totalAllocation - 100) < 0.01;

    const handleAddBucket = () => {
        setEditingBucket({
            id: `bucket-${Date.now()}`,
            name: '',
            allocation: 0,
            returnConfig: { mode: 'fixed', fixedRate: 0.05 },
            description: ''
        });
        setEditingBucketIndex(-1);
        setShowBucketModal(true);
    };

    const handleEditBucket = (index: number) => {
        setEditingBucket({ ...bucketConfigs[index] });
        setEditingBucketIndex(index);
        setShowBucketModal(true);
    };

    const handleSaveBucket = (bucket: BucketConfig) => {
        const newConfigs = [...bucketConfigs];
        if (editingBucketIndex >= 0) {
            newConfigs[editingBucketIndex] = bucket;
        } else {
            newConfigs.push(bucket);
        }
        onBucketConfigsChange(newConfigs);
        setShowBucketModal(false);
        setEditingBucket(null);
    };

    const handleDeleteBucket = (index: number) => {
        const newConfigs = bucketConfigs.filter((_, i) => i !== index);
        onBucketConfigsChange(newConfigs);
    };

    const formatPercent = (value: number) => (value * 100).toFixed(1) + '%';

    return (
        <>
            <Form.Group>
                <Form.ControlLabel>Basis-Entnahmerate (%)</Form.ControlLabel>
                <Form.Control 
                    name="bucketBasisrate" 
                    accepter={InputNumber} 
                    min={1} 
                    max={10} 
                    step={0.5}
                />
                <Form.HelpText>
                    Prozentsatz des Gesamtvermögens, der jährlich entnommen wird
                </Form.HelpText>
            </Form.Group>

            <Form.Group>
                <Form.ControlLabel>Jährliches Rebalancing</Form.ControlLabel>
                <Form.Control name="bucketRebalancing" accepter={Toggle} />
                <Form.HelpText>
                    Portfolio jährlich auf Ziel-Allokation zurücksetzen
                </Form.HelpText>
            </Form.Group>

            <Form.Group>
                <Form.ControlLabel>
                    Risiko-Töpfe (Buckets) 
                    {!isValidAllocation && (
                        <span style={{ color: 'red', marginLeft: '10px' }}>
                            ⚠️ Gesamtallokation: {totalAllocation.toFixed(1)}% (muss 100% sein)
                        </span>
                    )}
                </Form.ControlLabel>
                
                {!isValidAllocation && (
                    <Message type="error" style={{ marginBottom: '10px' }}>
                        Die Summe aller Bucket-Allokationen muss genau 100% betragen. 
                        Aktuelle Summe: {totalAllocation.toFixed(1)}%
                    </Message>
                )}

                <Table
                    data={bucketConfigs}
                    autoHeight
                    bordered
                    cellBordered
                    style={{ marginBottom: '10px' }}
                >
                    <Column width={150}>
                        <HeaderCell>Name</HeaderCell>
                        <Cell dataKey="name" />
                    </Column>
                    <Column width={100}>
                        <HeaderCell>Allokation</HeaderCell>
                        <Cell>
                            {(rowData: BucketConfig) => `${rowData.allocation}%`}
                        </Cell>
                    </Column>
                    <Column width={120}>
                        <HeaderCell>Rendite</HeaderCell>
                        <Cell>
                            {(rowData: BucketConfig) => {
                                if (rowData.returnConfig.mode === 'fixed') {
                                    return formatPercent(rowData.returnConfig.fixedRate || 0.05);
                                } else if (rowData.returnConfig.mode === 'random') {
                                    return `Ø ${formatPercent(rowData.returnConfig.randomConfig?.averageReturn || 0.05)}`;
                                }
                                return 'Variable';
                            }}
                        </Cell>
                    </Column>
                    <Column width={200}>
                        <HeaderCell>Beschreibung</HeaderCell>
                        <Cell dataKey="description" />
                    </Column>
                    <Column width={120}>
                        <HeaderCell>Aktionen</HeaderCell>
                        <Cell>
                            {(_rowData: BucketConfig, rowIndex?: number) => (
                                <ButtonGroup size="xs">
                                    <Button onClick={() => handleEditBucket(rowIndex || 0)}>
                                        Bearbeiten
                                    </Button>
                                    <Button 
                                        color="red" 
                                        appearance="ghost"
                                        onClick={() => handleDeleteBucket(rowIndex || 0)}
                                    >
                                        Löschen
                                    </Button>
                                </ButtonGroup>
                            )}
                        </Cell>
                    </Column>
                </Table>

                <Button 
                    appearance="primary" 
                    onClick={handleAddBucket}
                    style={{ marginTop: '10px' }}
                >
                    + Bucket hinzufügen
                </Button>
            </Form.Group>

            <BucketEditModal
                show={showBucketModal}
                bucket={editingBucket}
                onClose={() => setShowBucketModal(false)}
                onSave={handleSaveBucket}
            />
        </>
    );
}

type BucketEditModalProps = {
    show: boolean;
    bucket: BucketConfig | null;
    onClose: () => void;
    onSave: (bucket: BucketConfig) => void;
};

function BucketEditModal({ show, bucket, onClose, onSave }: BucketEditModalProps) {
    const [formData, setFormData] = useState<BucketConfig | null>(bucket);
    const [returnMode, setReturnMode] = useState<'fixed' | 'random' | 'variable'>('fixed');

    React.useEffect(() => {
        if (bucket) {
            setFormData({ ...bucket });
            setReturnMode(bucket.returnConfig.mode);
        }
    }, [bucket]);

    if (!formData) return null;

    const handleSave = () => {
        if (formData.name && formData.allocation > 0) {
            onSave(formData);
        }
    };

    const updateReturnConfig = (mode: 'fixed' | 'random' | 'variable', value?: any) => {
        let newReturnConfig: ReturnConfiguration;
        
        if (mode === 'fixed') {
            newReturnConfig = { mode: 'fixed', fixedRate: value || 0.05 };
        } else if (mode === 'random') {
            newReturnConfig = { 
                mode: 'random', 
                randomConfig: { 
                    averageReturn: value?.averageReturn || 0.05,
                    standardDeviation: value?.standardDeviation || 0.15
                }
            };
        } else {
            newReturnConfig = { mode: 'variable', variableConfig: { yearlyReturns: {} } };
        }

        setFormData({
            ...formData,
            returnConfig: newReturnConfig
        });
    };

    return (
        <Modal open={show} onClose={onClose} size="md">
            <Modal.Header>
                <Modal.Title>
                    {bucket?.id.includes('bucket-') ? 'Bucket hinzufügen' : 'Bucket bearbeiten'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form fluid>
                    <Form.Group>
                        <Form.ControlLabel>Name</Form.ControlLabel>
                        <Input
                            value={formData.name}
                            onChange={(value) => setFormData({ ...formData, name: value })}
                            placeholder="z.B. Aktien, Anleihen, Cash"
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.ControlLabel>Allokation (%)</Form.ControlLabel>
                        <InputNumber
                            value={formData.allocation}
                            onChange={(value) => setFormData({ ...formData, allocation: Number(value) || 0 })}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.ControlLabel>Beschreibung</Form.ControlLabel>
                        <Input
                            value={formData.description || ''}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            placeholder="Beschreibung des Risiko-Topfs"
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.ControlLabel>Rendite-Konfiguration</Form.ControlLabel>
                        <RadioGroup
                            inline
                            value={returnMode}
                            onChange={(value) => {
                                const newMode = value as 'fixed' | 'random' | 'variable';
                                setReturnMode(newMode);
                                updateReturnConfig(newMode);
                            }}
                        >
                            <Radio value="fixed">Feste Rendite</Radio>
                            <Radio value="random">Zufällige Rendite</Radio>
                            <Radio value="variable">Variable Rendite</Radio>
                        </RadioGroup>
                    </Form.Group>

                    {returnMode === 'fixed' && (
                        <Form.Group>
                            <Form.ControlLabel>Jährliche Rendite (%)</Form.ControlLabel>
                            <Slider
                                min={-5}
                                max={15}
                                step={0.5}
                                value={(formData.returnConfig.fixedRate || 0.05) * 100}
                                onChange={(value) => updateReturnConfig('fixed', value / 100)}
                                graduated
                                progress
                                renderMark={(mark) => `${mark}%`}
                            />
                            <div style={{ textAlign: 'center', marginTop: '5px' }}>
                                {((formData.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}%
                            </div>
                        </Form.Group>
                    )}

                    {returnMode === 'random' && (
                        <>
                            <Form.Group>
                                <Form.ControlLabel>Durchschnittliche Rendite (%)</Form.ControlLabel>
                                <InputNumber
                                    value={(formData.returnConfig.randomConfig?.averageReturn || 0.05) * 100}
                                    onChange={(value) => updateReturnConfig('random', {
                                        averageReturn: (Number(value) || 5) / 100,
                                        standardDeviation: formData.returnConfig.randomConfig?.standardDeviation || 0.15
                                    })}
                                    min={-10}
                                    max={20}
                                    step={0.5}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Volatilität (%)</Form.ControlLabel>
                                <InputNumber
                                    value={(formData.returnConfig.randomConfig?.standardDeviation || 0.15) * 100}
                                    onChange={(value) => updateReturnConfig('random', {
                                        averageReturn: formData.returnConfig.randomConfig?.averageReturn || 0.05,
                                        standardDeviation: (Number(value) || 15) / 100
                                    })}
                                    min={1}
                                    max={50}
                                    step={1}
                                />
                            </Form.Group>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Abbrechen
                </Button>
                <Button onClick={handleSave} appearance="primary">
                    Speichern
                </Button>
            </Modal.Footer>
        </Modal>
    );
}