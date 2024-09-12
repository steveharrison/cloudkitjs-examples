"use client"

import CloudKit from 'tsl-apple-cloudkit';
import { UserIdentity } from 'tsl-apple-cloudkit';
import { getUser, fetchTasks, saveTask } from './store';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
// import { Checkbox } from "@/components/ui/checkbox"
import { CirclePlus } from "lucide-react"
import { Spinner } from '@/components/ui/spinner'

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [addTaskInputValue, setAddTaskInputValue] = useState('');

  useEffect(() => {
    (async () => {
      CloudKit.getDefaultContainer()
        .whenUserSignsIn()
        .then(async (user: CloudKit.UserIdentity) => {
          console.log('whenUserSignsIn: ', user);
          setUser(user);
          await updateTasks();
        });
      
      CloudKit.getDefaultContainer()
        .whenUserSignsOut()
        .then(() => {
          console.log('whenUserSignsOut: ', user);
          setUser(null);
        });

      try {
        const user = await getUser();
        setUser(user);
        await updateTasks();
      } catch (error) {
        console.error('Error signing in: ', user);
      }
    })();
  }, []);
  
  async function updateTasks() {
    console.log('updateTasks called.');
    const tasks = await fetchTasks();
    setTasks(tasks);
  }

  async function addTask() {
    const task = await saveTask(addTaskInputValue, new Date(), false);
    setTasks([task, ...tasks]);
    setAddTaskInputValue('');
  }

  return (
    <div className="p-8 m-auto" style={{ maxWidth: '1000px' }}>
      <header className="flex items-center justify-between space-y-2 pb-4 items-center">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <div className="ml-auto">
          <button id="apple-sign-out-button"></button>
        </div>
      </header>
      <main>
        {user ? (
          <>
            <div className="flex flex-row gap-3 mb-4">
              <Input
                value={addTaskInputValue}
                onChange={(event) => { setAddTaskInputValue(event.target.value); }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    addTask();
                  }
                }}
              />
              <Button variant="outline" className="font-bold" onClick={addTask}>
                <CirclePlus className="mr-2" />
                Add Task
              </Button>
            </div>
            <div className="flex-1 space-y-4 rounded-md border">
              {tasks.length > 0 ? (
                <Table>
                  <TableBody>
                    {tasks.map((task: any) => (
                      <TableRow key={task.recordName}>
                        <TableCell className="flex gap-3 items-center">
                          {/* @todo Add the ability to update tasks. */}
                          {/* <Checkbox id={task.recordName} />  */}
                          <Label className="text-md" htmlFor={task.recordName}>
                            {task.fields.title.value}
                          </Label>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex p-4 items-center justify-center gap-4" style={{ minHeight: '100px' }}>
                  <div className="flex gap-4 items-center font-bold" style={{ color: '#b0b0b0' }}>
                    <Spinner size="small" color="#b0b0b0" />
                    Loading...
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            Sign in to view and add tasks.
            <button id="apple-sign-in-button"></button>
          </div>
        )}
      </main>
    </div>
  );
}
