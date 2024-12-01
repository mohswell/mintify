import { Body, Put, Req, BadRequestException } from "@nestjs/common";
import { BaseController } from "~decorators/version.decorator";
import { UserProvider } from "~auth/providers/suppliers/user.provider";
import { updateUserDto } from "~dto";

@BaseController("user")
export class UserController {
    constructor(private readonly userProvider: UserProvider) { }

    @Put("update")
    async updateUser(@Req() req, @Body() updateUserDto) {
        const userId = req.user.id;
        if (!userId) {
            throw new BadRequestException('User ID is missing in the request');
        }
        return this.userProvider.updateUser(userId, updateUserDto);
    }
}
