'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const LorenzSystem = dynamic(() => import('@/components/LorenzSystem'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black/60" />,
});

// Only rerender the simulation when parameters change
const MemoLorenzSystem = React.memo(LorenzSystem);

export default function PhysicsPage() {
  const [params, setParams] = useState({
    sigma: 10,
    rho: 28,
    beta: 2.6667,
  });

  const [inputs, setInputs] = useState({
    sigma: '10',
    rho: '28',
    beta: '2.6667',
  });

  const handleUpdate = () => {
    setParams({
      sigma: parseFloat(inputs.sigma) || 10,
      rho: parseFloat(inputs.rho) || 28,
      beta: parseFloat(inputs.beta) || 2.6667,
    });
  };

  return (
    <div className="flex h-[100svh] w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <MemoLorenzSystem {...params} />
      </div>

      <div className="z-10 w-full p-3">
        <Card className="mx-auto w-full backdrop-blur-md md:w-[70%]">
          <CardContent className="grid grid-cols-2 items-end gap-3 pt-4 md:grid-cols-4">
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="sigma">Sigma (&#963;)</Label>
              <Input
                id="sigma"
                value={inputs.sigma}
                onChange={(e) => setInputs({ ...inputs, sigma: e.target.value })}
                className="w-[6rem] border-zinc-700"
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="rho">Rho (&#961;)</Label>
              <Input
                id="rho"
                value={inputs.rho}
                onChange={(e) => setInputs({ ...inputs, rho: e.target.value })}
                className="w-[6rem] border-zinc-700"
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="beta">Beta (&#946;)</Label>
              <Input
                id="beta"
                value={inputs.beta}
                onChange={(e) => setInputs({ ...inputs, beta: e.target.value })}
                className="w-[6rem] border-zinc-700"
              />
            </div>
            <Button onClick={handleUpdate} className="mx-auto w-[6rem]">
              Update
            </Button>
          </CardContent>
          <CardHeader className="pt-0">
            <CardTitle>Lorenz attractor</CardTitle>
            <CardDescription>
              <a
                href="https://en.wikipedia.org/wiki/Lorenz_system"
                className="text-blue-500 hover:underline">
                The Lorenz system
              </a>{' '}
              is a set of three ordinary differential equations first developed by Edward Lorenz
              while studying atmospheric convection. The system can exhibit chaotic behavior,
              meaning its output can be highly sensitive to small changes in its starting
              conditions.
              <br />
              <br />
              This real-time simulation is powered by a Go microservice that streams data to an
              ASP.NET backend using gRPC.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
