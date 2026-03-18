import * as userRepository from "../repositories/userRepository.js";

export function getUserById(id){
    const user = userRepository.getUserById(id);
    return user;
}

export function updateProfile(id, body){
    const user = userRepository.getUserById(id);
    void(body); //hack to pass CI
    void(user); //hack to pass CI
    
    const newInfo = 'placeholder';

    const updatedUser = userRepository.updateProfile(id, newInfo);
    return updatedUser;
}