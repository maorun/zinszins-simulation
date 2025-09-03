import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import SavingsPlan from './SavingsPlan';
import WithdrawalPlan from './WithdrawalPlan';

const SimulationModeSelector = () => {
  return (
    <Tabs defaultValue="ansparen">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ansparen">Ansparen</TabsTrigger>
        <TabsTrigger value="entnehmen">Entnehmen</TabsTrigger>
      </TabsList>
      <TabsContent value="ansparen">
        <SavingsPlan />
      </TabsContent>
      <TabsContent value="entnehmen">
        <WithdrawalPlan />
      </TabsContent>
    </Tabs>
  );
};

export default SimulationModeSelector;
