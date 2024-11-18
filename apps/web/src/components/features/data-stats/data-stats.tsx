"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface DataStats {
  count: number;
  percentageChange: number;
}

interface Stats {
  users: DataStats;
  images: DataStats;
  sessions: DataStats;
}

const DataStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    users: {
      count: 10000,
      percentageChange: 5.2,
    },
    images: {
      count: 25000,
      percentageChange: -2.1,
    },
    sessions: {
      count: 50000,
      percentageChange: 8.4,
    },
  });

  const dataStatsList = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 18C9.66667 15.6667 6.66667 14 3 14C2.44772 14 2 14.4477 2 15V18C2 18.5523 2.44772 19 3 19H21C21.5523 19 22 18.5523 22 18V15C22 14.4477 21.5523 14 21 14C17.3333 14 14.3333 15.6667 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Total Users',
      value: stats.users.count,
      growthRate: stats.users.percentageChange,
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7L12 3L22 7V17L12 21L2 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 11L12 15L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Total Images',
      value: stats.images.count,
      growthRate: stats.images.percentageChange,
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 3L6 8L12 12M6 8L6 18L12 16M6 8L12 4L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Total Sessions',
      value: stats.sessions.count,
      growthRate: stats.sessions.percentageChange,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex items-start">
        <div className="flex flex-col gap-1">
          <CardTitle>Statistics Overview</CardTitle>
          <CardDescription>
            Summary of users, images, and sessions data
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataStatsList.map((stat, index) => (
          <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col items-start">
            <div className="w-14 h-14 rounded-full flex items-center justify-center dark:bg-gray-700">
              {stat.icon}
            </div>
            <div className="flex flex-col w-full">
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-100">{stat.title}</h2>
              <div className="flex items-center justify-between w-full">
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-100">{stat.value.toLocaleString()}</p>
                <p className={`text-lg ${stat.growthRate >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {stat.growthRate >= 0 ? (
                    <>
                      <svg className="w-5 h-5 mr-1" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21V9M12 9L18 15M12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {stat.growthRate.toFixed(2)}%
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-1" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3V15M12 15L18 9M12 15L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {stat.growthRate.toFixed(2)}%
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DataStats;