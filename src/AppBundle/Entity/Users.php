<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity
 * @ORM\Table(name="users")
 */
class Users implements UserInterface, \Serializable{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id;
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;
    
    /**
     * @ORM\Column(type="string")
     */
    private $username;
    
    /**
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @ORM\Column(type="string")
     */
    private $createdAt;
    
    /**
     * @ORM\Column(type="string")
     */
    private $updatedAt;

    /**
     * @ORM\Column(type="string")
     */
    private $roles;

    public function getCreatedAt(){
        return $this->createdAt;
    }

    public function setCreatedAt($createdAt){
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(){
        return $this->updatedAt;
    }

    public function setUpdatedAt($updatedAt){
        $this->updatedAt = $updatedAt;
        return $this;
    }
	
    public function getId(){
        return $this->id;
    }

    public function setId($id){
        $this->id = $id;
        return $this;
    }

    public function getPassword(){
        return $this->password;
    }

    public function setPassword($sPassword){
        $this->password = $sPassword;
        return $this;
    }

    public function getUsername(){
        return $this->username;
    }

    public function setUsername($username){
        $this->username = $username;
        return $this;
    }

    public function serialize(){
        return serialize([$this->id, $this->username, $this->password]);
    }
    
    public function unserialize($serialized){
        list($this->id, $this->username, $this->password) = unserialize($serialized);
    }    

    public function eraseCredentials(){}

    public function getSalt(){}

    public function getRoles(){
        return explode('|', $this->roles);
    }    

    public function setRoles($aRoles){
        $this->roles = implode('|', $aRoles);
    }    
}
