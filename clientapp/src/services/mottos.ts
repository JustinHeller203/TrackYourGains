import { api } from "@/lib/api";

export type MottoDto = {
    text: string;
};

export async function getRandomMotto() {
    const { data } = await api.get<MottoDto>("/mottos/random");
    return data;
}
