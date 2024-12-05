import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    name: string;
};
//Ping Pong Test
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    console.log(`Request method: ${req.method}`);
    res.status(200).json({ name: "pong" });
}